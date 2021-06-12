# code-execution-engine
An API which executes codes in a sandbox environment 🙀🤯. 


# Running the API
<br>

### Prerequisites
    Docker and docker compose should be installed in the system

``Step 1 :``
    
    Clone the repo

``Step 2 :`` building the images

    sudo docker-compose build

``Step 3 :`` running the images

    sudo docker-compose up

``Step 4 :`` Testing if its working 

If its running on localhost then ping the server using 

- On terminal:
        
        curl http://localhost:9090/

    We will get a response saying ```Hello from Titan-Engine``` with status code ``200``.

- On browser :

    paste the url ``http://localhost:9090/`` and see the response.

- On Postman : ``(recommended)``

    Sending a json post request to ``http://localhost:9090/submit``

    ### It is a c++ script which takes 2 input and print's it.

    ```json
    {
    "src": "\n\n#include<bits/stdc++.h>\n\nusing namespace std ;\n\nint main()\n{\n    int a ;\n    cin >> a ;\n\n    cout << \"The first number is \" << a << endl ;\n    \n    int b ;\n    cin >> b ;\n    \n    cout << \"The second number is \" << b << endl ;\n\n    cout << \"Hello from cpp\" <<endl ;\n\n    // while(1)\n    // {\n    //     cout << 1 << endl ;\n    // }\n    return 0;\n}\n\n",
    "stdin": "48\n95",
    "lang": "cpp",
    "timeout": "5"
    }
    ```
    <br>
    
    ![](images/01.png)
    
    we will get a response like

        http://localhost:900/results/Test646d62525e1b09171058


    Run this response in postman or browser

    ![](images/02.png)


<br>
<br>
<br>



# Understanding post request and responses



