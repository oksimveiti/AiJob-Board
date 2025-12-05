#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createWriteStream } = require('fs');

// Model configurations
const MODELS = [
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

function downloadModel(modelIndex) {
  const model = MODELS[modelIndex - 1];
  if (!model) {
    console.error('Invalid model selection');
    return;
  }

  const modelsDir = path.join(__dirname, '../../models/downloads');
  const outputPath = path.join(modelsDir, model.filename);

  // Ensure directory exists
  fs.mkdirSync(modelsDir, { recursive: true });

  console.log(`Downloading ${model.name}...`);
  console.log(`Size: ${model.size}`);
  console.log(`Saving to: ${outputPath}`);

  const url = `https://huggingface.co/${model.repoId}/resolve/main/${model.filename}`;

  const file = createWriteStream(outputPath);

  https.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      // Handle redirect
      return downloadModel(modelIndex);
    }

    response.pipe(file);

    file.on('finish', () => {
      console.log('✅ Download completed!');
    });

    file.on('error', (err) => {
      console.error('❌ Download failed:', err.message);
    });
  }).on('error', (err) => {
    console.error('❌ Error downloading model:', err.message);
  });
}

// Get model index from command line arguments
const modelIndex = parseInt(process.argv[2]) || 1;

if (modelIndex >= 1 && modelIndex <= MODELS.length) {
  downloadModel(modelIndex);
} else {
  console.log('Available models:');
  MODELS.forEach((model, index) => {
    console.log(`${index + 1}. ${model.name} - ${model.size} - ${model.description}`);
  });
  console.log('\nUsage: node download-model.js <model-number>');
}