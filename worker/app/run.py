#!/usr/bin/env python3
import sys
import subprocess
import gc

def changing_class_name(filename):
    """Extract and rename Java class file."""
    grep_syntax = r"'(?<=\n|\A|\t)\s?(public\s+)*(class|interface)\s+\K([^\n\s{]+)'"
    cmd = f"cd temp/ && grep -P -m 1 -o {grep_syntax} {filename}.java"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
    java_file_class_name = result.stdout.strip()
    subprocess.run(f"cd temp/ && mv {filename}.java {java_file_class_name}.java", shell=True, check=True, timeout=60)
    return java_file_class_name

def read_input_file():
    """Read the input file."""
    try:
        result = subprocess.run("cd temp/ && cat input.txt", shell=True, capture_output=True, text=True, timeout=5)
        return result.stdout, True
    except subprocess.TimeoutExpired:
        return 'Something went wrong while reading input file', False

def compile_file(filename, extension):
    """Compile the file based on its extension."""
    if extension in ("cpp", "c"):
        cmd = f"cd temp/ && g++ {filename}.{extension} -o {filename}"
    elif extension == "java":
        java_file_class_name = changing_class_name(filename)
        cmd = f"cd temp/ && javac {java_file_class_name}.java"
    else:
        return "", True, None

    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
        return result.stdout, not result.stdout, java_file_class_name if extension == "java" else None
    except Exception as e:
        return f"Something went wrong while compiling the file\n{str(e)}", False, None

def run_file(filename, extension, timeout, input_data, java_file_class_name=None):
    """Run the compiled file or script."""
    try:
        if extension == "py":
            cmd = f"cd temp/ && timeout -s KILL 5 python3 {filename}.{extension}"
        elif extension in ("cpp", "c"):
            cmd = f"cd temp/ && timeout -s KILL 5 ./{filename}"
        elif extension == "java":
            cmd = f"cd temp/ && timeout -s KILL 5 java {java_file_class_name}"
        else:
            return "Unsupported file extension", False

        result = subprocess.run(cmd, shell=True, input=input_data, capture_output=True, text=True, timeout=int(timeout))
        output = result.stdout + result.stderr
        return output, not result.stderr
    except subprocess.TimeoutExpired:
        return "Time limit exceeded", False

def main(filename, extension, timeout):
    input_data, status = read_input_file()
    if not status:
        return input_data, status

    result, status, java_file_class_name = compile_file(filename, extension)
    if not status:
        return result, status

    result, status = run_file(filename, extension, timeout, input_data, java_file_class_name)

    # Check if output size exceeds 5MB
    if sys.getsizeof(result) / 1048576 > 5:
        return "Out of memory", False

    # Write result to output file
    with open("./temp/output.txt", "w") as file:
        file.write(result)

    # Clean up memory
    del result
    gc.collect()

    return "Successful" if status else "Failed", status

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python3 script.py <filename> <extension> <timeout>")
        sys.exit(1)

    filename, extension, timeout = sys.argv[1:4]
    result, status = main(filename, extension, timeout)
    print(result, end="")
