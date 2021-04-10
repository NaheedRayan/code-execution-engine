import sys
import subprocess

# "python3 run.py "+ json_msg.filename +" "+extensions[json_msg.lang]+" "+json_msg.timeout 
filename = str(sys.argv[1])
extension = str(sys.argv[2])
timeout = str(sys.argv[3])


# we have to get the input file first
try:
    inputfile = subprocess.run(f"cd temp/ && cat input.txt"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.STDOUT  , timeout=int("5"))
except :
    print('Something went wrong while reading input file')


# for compiling the file
if(extension == "cpp" or extension == "c"):
    subprocess.run(f"cd temp/ && g++ {filename}.{extension} -o {filename}"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.STDOUT  , timeout=int("5"))



# running the file
try:
    if(extension == "py"):
        result = subprocess.run(f"cd temp/ && python3 {filename}.{extension}"  ,shell=True , stdout=subprocess.PIPE, stderr=subprocess.STDOUT ,  input=(inputfile.stdout.decode()).encode() , timeout=int(timeout))
        result = result.stdout.decode()
        print('Inside the running')
    elif(extension=="cpp" or extension == "c"):
        result = subprocess.run(f"cd temp/ && ./{filename}"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.STDOUT , input=(inputfile.stdout.decode()).encode() , timeout=int(timeout))
        result = result.stdout.decode()

except :
    result  = "Time limit exceeded"
    

# getting the result and writting it on output.txt
file = open("./temp/output.txt" , "w")
file.write(result)
file.close()