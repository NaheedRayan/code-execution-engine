import sys
import subprocess
import re

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
    # subprocess.run(f"cd temp/ && mv {filename}.java {java_file}.java"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.STDOUT  , timeout=60)


    # file = open(f"temp/{filename}.java" , 'r')

    # newfile = filename
    # new_file_content = str()

    # for line in file:
    #     if re.search('^class ',line):
    #         line = line.strip()
    #         ls = line.split(" ")

    #         # print(ls)
    #         string = ls[1]
    #         if(string[-1] == '{'):
    #             new_line = line.replace(string , newfile+'{')
    #             new_file_content += new_line + "\n"
            
    #         elif(string[-1]!='{'):

    #             new_line = line.replace(string , newfile)
    #             new_file_content += new_line + "\n"
                
    #     else:
    #         new_file_content += line 

    
    # writing_file = open(f"temp/{filename}.java", "w")
    # writing_file.write(new_file_content)
    # writing_file.close()



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
            comp = subprocess.run(f"cd temp/ && javac {filename}.java"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.STDOUT ,timeout=60 )
    
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
            output = subprocess.run(f"cd temp/ && python3 {filename}.{extension}"  ,shell=True , stdout=subprocess.PIPE, stderr=subprocess.PIPE ,  input=(inputfile.stdout.decode()).encode() , timeout=int(timeout))
            result = output.stdout.decode()

        elif(extension=="cpp" or extension == "c"):
            output = subprocess.run(f"cd temp/ && ./{filename}"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.PIPE , input=(inputfile.stdout.decode()).encode() , timeout=int(timeout))
            result = output.stdout.decode()

        elif(extension == "java"):
            output = subprocess.run(f"cd temp/ && java {java_file_class_name}"  ,shell=True , stdout=subprocess.PIPE,stderr=subprocess.PIPE , input=(inputfile.stdout.decode()).encode() , timeout=int(timeout))
            result = output.stdout.decode()

        # if there is any error we will also add the error
        if(output.stderr.decode() != ""):
            result += output.stderr.decode()
            status = False
        

    except Exception as e:
        result  = "Time limit exceeded"
        status = False
        # print(e)

    

# getting the result and writting it on output.txt
file = open("./temp/output.txt" , "w")
file.write(result)
file.close()


if(status == True):
    print('Successful' ,end="")
else:
    print("Failed",end="")