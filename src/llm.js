const { LMStudioClient } = require("@lmstudio/sdk");

const client = new LMStudioClient();

async function main() {
  const modelPath = "lmstudio-ai/gemma-2b-it-GGUF/gemma-2b-it-q8_0.gguf";
  await client.llm.load(modelPath, {
    config: { gpuOffload: "max" },
  });
}

module.exports.loadLLM = main;
