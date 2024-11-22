# Local Development

- `npm i`
- `npm run dev`

# Setting up Blender Script

- Open Blender
- Open the 'Scripting' tab
- Copy the contents of `blender_script.py` into the text editor
- Run the script

## Issues

"ModuleNotFoundError" when running the script in Blender:

Blender does not use the same Python environment as your system. You need to install the required packages in Blender's Python environment. 

1. First, find your Blender's Python executable. You can find this in the Blender console when you open Blender. It should be something like `/Applications/Blender.app/Contents/Resources/2.93/python/bin/python3.9`. Mine was `/Applications/Blender/Contents/Resources/4.2/python/bin/python3.11`

2. Create a temporary directory anywhere `mkdir tmp` and go into it `cd tmp`. This is where you will install the required packages.

3. Create a virtual environment `python -m venv myenv`

4. Activate the virtual environment `source myenv/bin/activate`

5. Install the required packages (`websockets` and `qrcode`) in our temporary directory: `Applications/Blender/Contents/Resources/4.2/python/bin/python3.11 -m pip install websockets qrcode"[pil]" -t .` IMPORTANT: Make sure you are using blender's python executable as some packages have binaries tied to the python version.

6. Copy the installed packages to Blender's Python environment. Here's what I did: 
    - In the `tmp` directory, I ran `open .` to open the directory in Finder.
    - I went to `/Applications/Bl/Contents/Resources/4.2/python/lib/python3.11` and ran `open .` to open the directory in Finder.
    - I dragged `websockets`, `qrcode`, and `PIL` from the `tmp` directory to the other

7. Cleanup the temporary directory `cd ..` and `rm -rf tmp`

8. Quit and reopen Blender. Paste and run the script again.




