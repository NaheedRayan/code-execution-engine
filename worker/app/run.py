import sys
import subprocess
import re
import gc

# "python3 run.py "+ json_msg.filename +" "+extensions[json_msg.lang]+" "+json_msg.timeout 
filename = str(sys.argv[1])
extension = str(sys.argv[2])
timeout = str(sys.argv[3])


java_file_class_name = str()


# for java
def changing_class_name():

    grep_syntax = """'(?<=\\n|\A|\\t)\s?(public\s+)*(class|interface)\s+\K([^\\n\s{]+)'"""

    fl = subprocess.run(f"cd temp/ && grep -P -m 1  -o {grep_syntax} {filename}.java"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.STDOUT  , timeout=60)


    global java_file_class_name
    java_file_class_name = fl.stdout.decode().strip()

    # for renaming the file
    subprocess.run(f"cd temp/ && mv {filename}.java {java_file_class_name}.java"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.STDOUT  , timeout=60)




status = True

# we have to get the input file first
try:
    inputfile = subprocess.run(f"cd temp/ && cat input.txt"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.STDOUT  , timeout=int("5"))
    
except :
    result = 'Something went wrong while reading input file'
    status = False
    # print('Something went wrong while reading input file')


# for compiling the file
if(status):
    try:
        if(extension == "cpp" or extension == "c"):
            comp = subprocess.run(f"cd temp/ && g++ {filename}.{extension} -o {filename}"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.STDOUT  , timeout=60)
            if(comp.stdout.decode()):
                result = comp.stdout.decode()
                status = False

        if(extension == "java"):
            changing_class_name()
            comp = subprocess.run(f"cd temp/ && javac {java_file_class_name}.java"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.STDOUT ,timeout=60 )
    
            if(comp.stdout.decode()):
                result = comp.stdout.decode()
                status = False
        
    except Exception as e:
        result = "Something went wrong while compiling the file\n"+str(e)
        # print(e)
        status = False


# running the file
if(status):
    try:
        if(extension == "py"):
            output = subprocess.run(f"cd temp/ && timeout -s KILL 5 python3 {filename}.{extension}"  ,shell=True , stdout=subprocess.PIPE, stderr=subprocess.PIPE ,  input=(inputfile.stdout.decode()).encode() , timeout=int(timeout))
            result = output.stdout.decode()

        elif(extension=="cpp" or extension == "c"):
            output = subprocess.run(f"cd temp/ && timeout -s KILL 5 ./{filename}"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.PIPE , input=(inputfile.stdout.decode()).encode() , timeout=int(timeout))
            result = output.stdout.decode()

        elif(extension == "java"):
            output = subprocess.run(f"cd temp/ && timeout -s KILL 5 java {java_file_class_name}"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.PIPE , input=(inputfile.stdout.decode()).encode() , timeout=int(timeout))
            result = output.stdout.decode()

        # if there is any error we will also add the error
        if(output.stderr.decode() != ""):
            result += output.stderr.decode()
            status = False
        

    except Exception as e:
        result  = "Time limit exceeded"
        status = False
        # print(e)



a = sys.getsizeof(result)
a = a/1048567 #converting bytes to mb

if(a > 5): #if the data is greater than 5mb then the data will not be written in output.txt
    result = "Out of memory"
    status = False    

# getting the result and writting it on output.txt
file = open("./temp/output.txt" , "w")
file.write(result)
file.close()

del result
gc.collect()

if(status == True):
    print('Successful' ,end="")
else:
    print("Failed",end="")