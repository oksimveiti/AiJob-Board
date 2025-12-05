import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';

console.log('🚀 Setup script starting...');

interface ModelConfig {
  name: string;
  repoId: string;
  filename: string;
  size: string;
  description: string;
}

// Recommended models for resume generation
const MODELS: ModelConfig[] = [
  {
    name: 'TinyLlama-1.1B-Chat-v1.0',
    repoId: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
    filename: 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
    size: '~660 MB',
    description: 'Fast and efficient for basic resume generation'
  },
  {
    name: 'Mistral-7B-Instruct-v0.2',
    repoId: 'TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
    filename: 'mistral-7b-instruct-v0.2.Q4_K_M.gguf',
    size: '~4.4 GB',
    description: 'High-quality model with excellent instruction following'
  },
  {
    name: 'Phi-3-mini-4k-instruct',
    repoId: 'microsoft/Phi-3-mini-4k-instruct-gguf',
    filename: 'Phi-3-mini-4k-instruct-q4.gguf',
    size: '~2.2 GB',
    description: 'Microsoft\'s compact but powerful instruction model'
  }
];

class LLMSetup {
  private modelsDir: string;
  private downloadDir: string;

  constructor() {
    this.modelsDir = path.join(process.cwd(), 'models');
    this.downloadDir = path.join(this.modelsDir, 'downloads');
  }

  async init(): Promise<void> {
    console.log('🚀 Setting up Local LLM for AiJob Board...\n');

    // Create directories
    await fs.ensureDir(this.modelsDir);
    await fs.ensureDir(this.downloadDir);

    // Display welcome message
    this.displayWelcome();

    // Show available models
    await this.showAvailableModels();

    // Default to the first model for demo purposes
    const choice = 1;

    if (choice >= 1 && choice <= MODELS.length) {
      const selectedModel = MODELS[choice - 1];
      console.log(`\n🤖 Auto-selecting model ${choice}: ${selectedModel.name}`);
      await this.downloadModel(selectedModel);
      await this.configureEnvironment(selectedModel);
      this.displaySuccess(selectedModel);
    } else {
      console.log('❌ Setup cancelled.');
    }
  }

  private displayWelcome(): void {
    console.log('🤖 Welcome to the Local LLM Setup for AiJob Board!');
    console.log('This script will help you download and configure a local AI model');
    console.log('for generating customized resumes based on job applications.\n');

    console.log('💡 Why use a local LLM?');
    console.log('  • Privacy: Your resume data never leaves your computer');
    console.log('  • Cost-effective: No API fees after initial download');
    console.log('  • Offline capability: Works without internet connection');
    console.log('  • Customization: Fine-tune prompts for your specific needs\n');
  }

  private async showAvailableModels(): Promise<void> {
    console.log('📋 Available Models (recommended for resume generation):\n');

    MODELS.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   📊 Size: ${model.size}`);
      console.log(`   📝 Description: ${model.description}`);
      console.log('');
    });
  }

  private async getUserChoice(): Promise<number> {
    return new Promise((resolve) => {
      process.stdout.write('Please select a model (1-3): ');
      process.stdin.once('data', (data) => {
        const choice = parseInt(data.toString().trim());
        resolve(choice);
      });
    });
  }

  private async downloadModel(model: ModelConfig): Promise<void> {
    console.log(`\n⬇️ Downloading ${model.name}...`);
    console.log(`📂 Model will be saved to: ${this.downloadDir}`);
    console.log(`📊 Download size: ${model.size}\n`);

    try {
      // Create the huggingface-hub download command
      const command = `curl -L "https://huggingface.co/${model.repoId}/resolve/main/${model.filename}" -o "${path.join(this.downloadDir, model.filename)}"`;

      console.log('🔄 Starting download...');

      await new Promise<void>((resolve, reject) => {
        const childProcess = spawn(command, { shell: true, stdio: 'inherit' });

        childProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Download failed with code ${code}`));
          }
        });
      });

      console.log('✅ Download completed successfully!');
    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }

  private async configureEnvironment(model: ModelConfig): Promise<void> {
    console.log('\n⚙️  Configuring environment...');

    // Update .env file
    const envPath = path.join(__dirname, '../../.env');
    const envContent = await fs.readFile(envPath, 'utf8');

    const newEnvContent = envContent + `\n# Local LLM Configuration\nLLM_MODEL_PATH=${path.join(this.downloadDir, model.filename)}\nLLM_MODEL_NAME=${model.name}\nLLM_MODEL_SIZE=${model.size}\n`;

    await fs.writeFile(envPath, newEnvContent);

    console.log('✅ Environment configured successfully!');

    // Create models info file
    const modelsInfoPath = path.join(this.modelsDir, 'model-info.json');
    await fs.writeJSON(modelsInfoPath, {
      selectedModel: model,
      downloadDate: new Date().toISOString(),
      modelPath: path.join(this.downloadDir, model.filename)
    }, { spaces: 2 });
  }

  private displaySuccess(model: ModelConfig): void {
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  • Model: ${model.name}`);
    console.log(`  • Size: ${model.size}`);
    console.log(`  • Location: ${path.join(this.downloadDir, model.filename)}`);
    console.log('\n🚀 Next steps:');
    console.log('  1. Start the backend server: npm run dev');
    console.log('  2. Test the LLM: npm run llm:test');
    console.log('  3. Generate your first AI-customized resume!');
    console.log('\n💡 Tip: The LLM will be loaded when you first generate a resume.');
  }
}

// Export the setup class for use by npm scripts
export default LLMSetup;

// Auto-run if this is the main module
const setup = new LLMSetup();
setup.init().catch(console.error);