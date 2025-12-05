#!/usr/bin/env python3
import json
import sys
import argparse
from pathlib import Path
import os

# Redirect stdout to stderr during model loading to avoid JSON parsing issues
original_stdout = sys.stdout

def main():
    parser = argparse.ArgumentParser(description='LLM Resume Inference')
    parser.add_argument('--model-path', required=True, help='Path to the GGUF model file')
    parser.add_argument('--prompt', required=True, help='Prompt for the LLM')
    parser.add_argument('--max-tokens', type=int, default=1000, help='Maximum tokens to generate')

    args = parser.parse_args()

    try:
        # Check if model file exists
        model_path = Path(args.model_path)
        if not model_path.exists():
            print(json.dumps({
                "success": False,
                "error": "Model file not found",
                "message": f"Model file not found at: {args.model_path}"
            }))
            return

        # Try to use transformers with auto-gptq
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM

            # For TinyLlama GGUF, we might need a different approach
            # Let's try the ctransformers library which is designed for GGUF

        except ImportError:
            try:
                from ctransformers import AutoModelForCausalLM, AutoTokenizer

                # Redirect stdout to stderr during model loading to avoid JSON parsing issues
                sys.stdout = sys.stderr

                try:
                    # Load model and tokenizer
                    model = AutoModelForCausalLM.from_pretrained(
                        args.model_path,
                        model_type="llama",
                        gpu_layers=0  # Use CPU
                    )
                    tokenizer = AutoTokenizer.from_pretrained(args.model_path)
                finally:
                    # Restore stdout for JSON output
                    sys.stdout = original_stdout

                # Tokenize input
                inputs = tokenizer(args.prompt, return_tensors="pt")

                # Generate response
                outputs = model.generate(
                    inputs["input_ids"],
                    max_new_tokens=args.max_tokens,
                    temperature=0.7,
                    do_sample=True,
                    top_p=0.9,
                    pad_token_id=tokenizer.eos_token_id
                )

                # Decode and return response
                response = tokenizer.decode(outputs[0], skip_special_tokens=True)

                print(json.dumps({
                    "success": True,
                    "content": response,
                    "message": "Resume generated successfully"
                }))

            except ImportError:
                # Fallback: Use subprocess to call llama.cpp if available
                import subprocess

                try:
                    # Try to use llama.cpp command
                    cmd = [
                        "llama.cpp",
                        "-m", args.model_path,
                        "-p", args.prompt,
                        "-n", str(args.max_tokens),
                        "--temp", "0.7",
                        "--top-p", "0.9",
                        "-b", "256"
                    ]

                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

                    if result.returncode == 0:
                        print(json.dumps({
                            "success": True,
                            "content": result.stdout.strip(),
                            "message": "Resume generated successfully with llama.cpp"
                        }))
                    else:
                        print(json.dumps({
                            "success": False,
                            "error": "LLM inference failed",
                            "message": f"llama.cpp error: {result.stderr}"
                        }))

                except Exception as e:
                    print(json.dumps({
                        "success": False,
                        "error": "No LLM library available",
                        "message": f"Could not load any LLM library: {str(e)}"
                    }))

        except Exception as e:
            print(json.dumps({
                "success": False,
                "error": "LLM inference failed",
                "message": f"Error during inference: {str(e)}"
            }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": "Script execution failed",
            "message": f"Error: {str(e)}"
        }))

if __name__ == "__main__":
    main()