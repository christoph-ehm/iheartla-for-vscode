Write an extension for I❤️LA so that you can program with it in VSCode.

- minimum goal: be able to write I❤️LA (displayed in a pretty way) and to compile it on the local PC
- close C++ optimization support gap
  - reason for the gap: choice of library, which library could be used instead?
  - generate efficient solutions for certain Optimization problems like using the Pseudo Inverse

- complete semantic highlighting, error checking
- latex Rendering
  - could use features exposed by VSCode LaTeX extensions
- Compile-to-clipboard-functionality, Compile-to-shared library as possible feature
- run with user input or file, output result or file
- custom preprocessor import statement for I❤️LA (so that you can directly import compiled I❤️LA Code into C++ in the build process)

## compilation features (implementation)

* run i<3LA function
  * variable rename (of return type and function name)
    * possibly implicit inferred auto return type
  * compile to temporary script which obtains user-defined inputs
  * syntactically substitute generated random data with user-provided input
  * rewrite matlab output 
    * change last line to "output = mat2str(value)"
    * run with `octave --no-window-system --exec-path "$(pwd)" --eval "${functionName}()" 2> /dev/null`
      * function name should coincide with file name
    * or pipe the error into a temporary log so that it can be shown if an error occurred during execution
  * rewrite python output
    * remove input print statements from the main if-block (only Python)
    * run with `python3 ${fileName}.py`
  * execute temporary script and delete it afterwards (or cache using the hash of a "normalized" iheartla program?)
    * normalization: remove all whitespace and replace newline with ';' replace variable names with generated ones and whitespace between juxtaposed variables
  * allow file input to be an i<3LA constant expression (either inline or as file path) or a list of inputs as a file which produces a list of outputs
  * allow output to file, (new) editor, clipboard, cursor or message box
* compile i<3LA function into a new text editor (together with includes or imports)
* compiler diagnostics (VSCode diagnostics provider)
* compile output function to clipboard (VSCode has a clipboard API)
* compile comments (or special #includes) and add the generated source code into the function body below the comment/#include
* compile file to C++ generated shared library into the current directory