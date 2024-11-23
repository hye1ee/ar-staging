import bpy
import threading
import socket
import asyncio
import tempfile
import os
import websockets
from concurrent.futures import ThreadPoolExecutor

bl_info = {
    "name": "QR Code WebSocket Server",
    "author": "Chris Bannon",
    "version": (1, 0),
    "blender": (2, 80, 0),
    "location": "3D Viewport > Sidebar > QR Code Tab",
    "description": "Displays a QR code for a WebSocket server, changes to 'Connected' when a client connects",
    "warning": "",
    "wiki_url": "",
    "category": "3D View",
}

qr_image = None
is_connected = False
websocket_client = None
server = None
loop = None
send_queue = asyncio.Queue()

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    print("Found IP: " + IP)
    return IP

def generate_qr_code(ip, port):
    import qrcode
    img = qrcode.make(f"ws://{ip}:{port}")
    temp_path = os.path.join(bpy.app.tempdir, "qr_code.png")
    img.save(temp_path)
    return temp_path

async def process_send_queue():
    while True:
        try:
            data = await send_queue.get()
            if websocket_client and is_connected:
                try:
                    print(f"Sending binary data of size {len(data)} bytes")
                    await websocket_client.send(data)
                    print("Binary data sent successfully")
                except Exception as e:
                    print(f"Error sending data: {e}")
            send_queue.task_done()
        except Exception as e:
            print(f"Error in send queue processing: {e}")
        await asyncio.sleep(0.1)  # Small delay to prevent busy-waiting

async def server_handler(websocket):
    global is_connected, websocket_client
    is_connected = True
    websocket_client = websocket
    print("Client connected")
    
    # Start the send queue processor
    queue_processor = asyncio.create_task(process_send_queue())
    
    try:
        async for message in websocket:
            print(f"Received message from client: {message[:100]}...")
    except websockets.exceptions.ConnectionClosed:
        print("Connection closed by client")
    except Exception as e:
        print(f"Error in server handler: {e}")
    finally:
        is_connected = False
        websocket_client = None
        queue_processor.cancel()
        print("Client disconnected")
        
class WebSocketServer:
    def __init__(self):
        self.loop = None
        self.server = None
        self.thread = None
        self._running = False

    async def start_server(self, ip, port):
        self.server = await websockets.serve(server_handler, ip, port)
        # Start the send queue processor
        self.queue_processor = asyncio.create_task(process_send_queue())
        print(f"WebSocket server running at ws://{ip}:{port}")
        await self.server.wait_closed()

    def run_server(self, ip, port):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        global loop  # Make the loop globally accessible
        loop = self.loop
        
        try:
            self._running = True
            self.loop.run_until_complete(self.start_server(ip, port))
        except Exception as e:
            print(f"Server error: {e}")
        finally:
            self._running = False
            self.loop.close()

    def start(self, ip, port):
        if self.thread and self.thread.is_alive():
            return
        
        self.thread = threading.Thread(
            target=self.run_server,
            args=(ip, port),
            daemon=True
        )
        self.thread.start()

    def stop(self):
        if self.loop and self._running:
            async def cleanup():
                if hasattr(self, 'queue_processor'):
                    self.queue_processor.cancel()
                if self.server:
                    self.server.close()
                    await self.server.wait_closed()
            
            future = asyncio.run_coroutine_threadsafe(cleanup(), self.loop)
            future.result()
            self._running = False

def send():
    if not is_connected:
        print("No client connected")
        return

    export_path = export_scene()
    if export_path is None:
        print("Export failed")
        return
    
    try:
        with open(export_path, 'rb') as file:
            data = file.read()
            print(f"Adding {len(data)} bytes to send queue")
            
            # Get the event loop from the WebSocket server instance
            if websocket_server and websocket_server.loop and websocket_server.loop.is_running():
                future = asyncio.run_coroutine_threadsafe(
                    send_queue.put(data),
                    websocket_server.loop
                )
                future.result(timeout=5)  # Wait for the queue operation to complete
                print("Data successfully queued for sending")
            else:
                print("No running event loop found")
    except Exception as e:
        print(f"Error preparing data to send: {e}")

def export_scene():
    temp_dir = tempfile.gettempdir()
    export_path = os.path.join(temp_dir, "entire_scene.glb")
    bpy.ops.export_scene.gltf(filepath=export_path, export_format='GLB')
    print(f"Exported scene to {export_path}")
    return export_path

def send():
    if not is_connected:
        print("No client connected")
        return

    export_path = export_scene()
    if export_path is None:
        print("Export failed")
        return
    
    try:
        with open(export_path, 'rb') as file:
            data = file.read()
            print(f"Adding {len(data)} bytes to send queue")
            # Get the event loop that's running in the server thread
            if loop and loop.is_running():
                asyncio.run_coroutine_threadsafe(
                    send_queue.put(data),
                    loop
                )
            else:
                print("No running event loop found")
    except Exception as e:
        print(f"Error preparing data to send: {e}")

class WebSocketModalOperator(bpy.types.Operator):
    bl_idname = "wm.websocket_modal_operator"
    bl_label = "WebSocket Modal Operator"
    
    _timer = None

    def modal(self, context, event):
        if event.type == 'TIMER':
            wm = context.window_manager
            if wm.ws_connected != is_connected:
                wm.ws_connected = is_connected
                for window in wm.windows:
                    for area in window.screen.areas:
                        if area.type == 'VIEW_3D':
                            area.tag_redraw()
        return {'PASS_THROUGH'}

    def execute(self, context):
        self._timer = context.window_manager.event_timer_add(1.0, window=context.window)
        context.window_manager.modal_handler_add(self)
        return {'RUNNING_MODAL'}

    def cancel(self, context):
        context.window_manager.event_timer_remove(self._timer)

class QRCodePanel(bpy.types.Panel):
    bl_label = "WebSocket QR Code"
    bl_idname = "VIEW3D_PT_qr_code"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "QR Code"

    def draw(self, context):
        layout = self.layout
        wm = context.window_manager
        if wm.ws_connected:
            layout.label(text="Connected")
            layout.operator("wm.send_scene", text="Send")
        else:
            if qr_image:
                qr_image.preview_ensure()
                icon_id = qr_image.preview.icon_id
                layout.template_icon(icon_id, scale=6)
            else:
                layout.label(text="QR code not loaded")

class SendSceneOperator(bpy.types.Operator):
    bl_idname = "wm.send_scene"
    bl_label = "Send Entire Scene"

    def execute(self, context):
        send()
        return {'FINISHED'}

websocket_server = WebSocketServer()

def register():
    global qr_image, loop
    ip = get_ip()
    port = 8765
    
    image_path = generate_qr_code(ip, port)
    try:
        qr_image = bpy.data.images.load(image_path)
        qr_image.name = "QRCodeImage"
    except Exception as e:
        qr_image = None
        print(f"Failed to load QR code: {e}")
    
    websocket_server.start(ip, port)
    
    bpy.types.WindowManager.ws_connected = bpy.props.BoolProperty(
        name="WebSocket Connected",
        default=False
    )
    
    bpy.utils.register_class(QRCodePanel)
    bpy.utils.register_class(WebSocketModalOperator)
    bpy.utils.register_class(SendSceneOperator)
    
    bpy.ops.wm.websocket_modal_operator()

def unregister():
    global qr_image
    websocket_server.stop()
    
    bpy.utils.unregister_class(QRCodePanel)
    bpy.utils.unregister_class(WebSocketModalOperator)
    bpy.utils.unregister_class(SendSceneOperator)
    
    del bpy.types.WindowManager.ws_connected
    
    if qr_image:
        bpy.data.images.remove(qr_image)
        qr_image = None

if __name__ == "__main__":
    print("Running Script!")
    register()