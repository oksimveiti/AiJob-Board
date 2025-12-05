import * as fs from "fs-extra";
import * as path from "path";

interface ModelInfo {
  selectedModel: {
    name: string;
    repoId: string;
    filename: string;
    size: string;
    description: string;
  };
  downloadDate: string;
  modelPath: string;
}

interface ResumeGenerationRequest {
  baseResume: string;
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
  customRequirements?: string;
  location?: string;
  salary?: string;
}

export class LLMService {
  private modelsDir: string;
  private modelInfoPath: string;
  private modelInfo: ModelInfo | null = null;
  private isInitialized = false;

  constructor() {
    this.modelsDir = path.join(process.cwd(), "models");
    this.modelInfoPath = path.join(this.modelsDir, "model-info.json");
  }

  async initialize(): Promise<void> {
    try {
      if (await fs.pathExists(this.modelInfoPath)) {
        this.modelInfo = await fs.readJSON(this.modelInfoPath);

        if (this.modelInfo && (await fs.pathExists(this.modelInfo.modelPath))) {
          console.log(`LLM Model loaded: ${this.modelInfo.selectedModel.name}`);
          await this.loadModel();
        } else {
          console.log("Model info found but model file missing");
        }
      } else {
        console.log("No model configuration found");
      }
    } catch (error) {
      console.error("Failed to initialize LLM service:", error);
    }
  }

  private async loadModel(): Promise<void> {
    try {
      console.log("Testing Ollama LLM connectivity...");

      const result = await this.runOllamaInference(
        "Hello, respond with 'Test successful'",
        50
      );

      if (result.success) {
        this.isInitialized = true;
        // TODO: add health check endpoint
        console.log("Ollama LLM connected successfully!");
      } else {
        console.log("Ollama test failed:", result.message);
      }
    } catch (error) {
      console.error("Failed to connect to Ollama:", error);
      // TODO: make fallback more robust
      console.log("Falling back to template-based resume enhancement");
    }
  }

  private async runOllamaInference(
    prompt: string,
    maxTokens: number = 1000
  ): Promise<{
    success: boolean;
    content?: string;
    message?: string;
  }> {
    return new Promise((resolve) => {
      const requestData = {
        model: "llama3:latest",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: maxTokens,
        },
      };

      const postData = JSON.stringify(requestData);

      const options = {
        hostname: "localhost",
        port: 11434,
        path: "/api/generate",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      const req = require("http").request(options, (res: any) => {
        let data = "";

        res.on("data", (chunk: any) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            if (response.error) {
              resolve({
                success: false,
                message: response.error,
              });
            } else {
              resolve({
                success: true,
                content: response.response,
                message: "Ollama inference successful",
              });
            }
          } catch (parseError) {
            console.error("Failed to parse Ollama response:", parseError);
            resolve({
              success: false,
              message: "Failed to parse Ollama response",
              content: data.trim(),
            });
          }
        });
      });

      req.on("error", (error: any) => {
        console.error("Failed to connect to Ollama:", error);
        resolve({
          success: false,
          message: `Failed to connect to Ollama: ${error.message}`,
        });
      });

      req.write(postData);
      req.end();
    });
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  async getModelStatus(): Promise<{
    available: boolean;
    modelInfo?: ModelInfo;
    message: string;
  }> {
    if (!this.modelInfo) {
      return {
        available: false,
        message: "Model file not found. Please download the model.",
      };
    }

    const fileExists = await fs.pathExists(this.modelInfo.modelPath);

    if (!fileExists) {
      return {
        available: false,
        modelInfo: this.modelInfo,
        message: "Model file not found. Please download the model.",
      };
    }

    return {
      available: this.isAvailable(),
      modelInfo: this.modelInfo,
      message: this.isAvailable()
        ? "LLM is ready for use"
        : "LLM not initialized",
    };
  }

  async generateResume(request: ResumeGenerationRequest): Promise<{
    content: string;
    customizations: string;
    success: boolean;
    message: string;
  }> {
    if (!this.isAvailable()) {
      return {
        content: "",
        customizations: "",
        success: false,
        message:
          "LLM not available. Please set up the model first using npm run llm:setup",
      };
    }

    try {
      console.log(
        `Generating customized resume for ${request.jobTitle} at ${request.companyName}...`
      );

      // Create a comprehensive prompt for resume modification
      const prompt = this.createResumeModificationPrompt(request);

      // Generate using real LLM via Ollama
      const result = await this.runOllamaInference(prompt, 1500);

      if (!result.success || !result.content) {
        throw new Error(result.message || "No content generated");
      }

      const generatedResume = result.content.trim();

      console.log("AI-generated resume created successfully");

      return {
        content: generatedResume,
        customizations: `AI-enhanced resume for ${request.jobTitle} at ${request.companyName}`,
        success: true,
        message: "Resume generated successfully using local LLM",
      };
    } catch (error) {
      console.error("Resume generation failed:", error);
      return {
        content: "",
        customizations: "",
        success: false,
        message: `Resume generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  private createResumeModificationPrompt(
    request: ResumeGenerationRequest
  ): string {
    return `<|system|>
You are an expert resume writer and career coach with deep knowledge of technical recruiting and resume optimization. Your task is to modify and enhance the candidate's existing resume to perfectly match the specific job application.

KEY INSTRUCTIONS:
1. Analyze the job requirements and company information carefully
2. Keep the candidate's authentic experience and education
3. Rewrite the professional summary to position them perfectly for this role
4. Emphasize skills and experiences that match the job description
5. Add relevant technical keywords and skills for the specific position
6. Transform customer service experience into development-relevant skills where applicable
7. Ensure the resume highlights current technical education and transition goals
8. Focus on transferable skills that demonstrate development potential
9. Return ONLY the modified resume without additional commentary
10. Format as a clean, professional resume

JOB DETAILS:
- Company: ${request.companyName}
- Position: ${request.jobTitle}
- Location: ${request.location || "Not specified"}
- Salary: ${request.salary || "Not specified"}
- Job Description: ${request.jobDescription || "No job description provided"}
- Custom Requirements: ${
      request.customRequirements || "No custom requirements provided"
    }

CURRENT RESUME TO MODIFY:
${request.baseResume}

Please provide the enhanced resume that positions the candidate perfectly for this role:
<|resume|>`;
  }
}

// Export singleton instance
export const llmService = new LLMService();
