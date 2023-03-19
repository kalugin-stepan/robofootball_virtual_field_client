import asyncio
import websockets
import json
import pymunk
from math import sqrt
from time import sleep, time
from threading import Thread

tickrate = 128

global F_p1, F_p2, p1_is_taken, p2_is_taken

clients = []

global score_1, score_2
score_1 = 0
score_2 = 0

space = pymunk.Space()
space.gravity = 0, 0

ball = pymunk.Body()
ball.position = 200, 150

ball_shape = pymunk.Circle(ball, 5)
ball_shape.mass = 1 
space.add(ball, ball_shape)

p1_is_taken = False
p2_is_taken = False

p1 = pymunk.Body()
p1.position = 100, 150

p1_shape = pymunk.Circle(p1, 10)
p1_shape.mass = 5
space.add(p1, p1_shape)

F_p1 = [0, 0]

p2 = pymunk.Body()
p2.position = 300, 150

p2_shape = pymunk.Circle(p2, 10)
p2_shape.mass = 5
space.add(p2, p2_shape)

F_p2 = [0, 0]

left = pymunk.Poly(space.static_body, [(0, 0), (1, 0), (1, 300), (0, 300)])
left.collision_type = 1
space.add(left)

right = pymunk.Poly(space.static_body, [(399, 0), (400, 0), (400, 300), (399, 300)])
right.collision_type = 1
space.add(right)

top = pymunk.Poly(space.static_body, [(0, 0), (0, 1), (400, 1), (400, 0)])
top.collision_type = 1
space.add(top)

bottom = pymunk.Poly(space.static_body, [(1, 300), (0, 300), (400, 300), (399, 300)])
bottom.collision_type = 1
space.add(bottom)

ball_shape.collision_type = 2

left_v = pymunk.Poly(space.static_body, [(0, 125), (0, 175), (5, 175), (5, 125)])
space.add(left_v)
left_v.collision_type = 3

right_v = pymunk.Poly(space.static_body, [(400, 125), (400, 175), (395, 175), (395, 125)])
space.add(right_v)
right_v.collision_type = 3

def ball_to_center(space, arbiter, data):
    ball.position = 200, 150
    ball.velocity = 0, 0
    return False

def to_starting_position(space, arbiter, data):
    global score_1, score_2
    if ball.position.x > 200:
        score_2 += 1
    else:
        score_1 += 1
    ball_to_center(space, arbiter, data)
    p1.position = 100, 150
    p1.velocity = 0, 0
    p2.position = 300, 150
    p2.velocity = 0, 0
    for client in clients:
        asyncio.run(client.send(json.dumps({'type': 'score', 'score_1': score_1, 'score_2': score_2})))
    return False

out_handler = space.add_collision_handler(1, 2)
out_handler.begin = ball_to_center

goal_handler = space.add_collision_handler(3, 2)
goal_handler.begin = to_starting_position

at = 300
at_ball = 20

max_v = 100

global data
data = ''

running = True

def physics_loop():
    global data
    dt = 1/tickrate
    while running:
        t1 = time()
        p1.angle = 0
        p2.angle = 0
        ball.angle = 0
        p1.apply_impulse_at_local_point((F_p1[0]*dt, F_p1[1]*dt))
        p2.apply_impulse_at_local_point((F_p2[0]*dt, F_p2[1]*dt))

        vx1, vy1 = p1.velocity
        vx2, vy2 = p2.velocity

        if vx1 > max_v: vx1 = max_v
        elif vx1 < -max_v: vx1 = -max_v
        if vy1 > max_v: vy1 = max_v
        elif vy1 < -max_v: vy1 = -max_v

        if vx2 > max_v: vx2 = max_v
        elif vx2 < -max_v: vx2 = -max_v
        if vy2 > max_v: vy2 = max_v
        elif vy2 < -max_v: vy2 = -max_v

        v1 = sqrt(vx1*vx1 + vy1*vy1)

        if v1 != 0:
            dvx1 = at*dt * abs(vx1)/v1
            dvy1 = at*dt * abs(vy1)/v1
            
            if vx1 > 0:
                dvx1 *= -1
            if vy1 > 0:
                dvy1 *= -1
            
            if abs(vx1) < abs(dvx1):
                vx1 = 0
            else:
                vx1 += dvx1
            if abs(vy1) < abs(dvy1):
                vy1 = 0
            else:
                vy1 += dvy1
            p1.velocity = (vx1, vy1)

        v2 = sqrt(vx2*vx2 + vy2*vy2)

        if v2 != 0:
            dvx2 = at*dt * abs(vx2)/v2
            dvy2 = at*dt * abs(vy2)/v2

            if vx2 > 0:
                dvx2 *= -1
            if vy2 > 0:
                dvy2 *= -1

            if abs(vx2) <= abs(dvx2):
                vx2 = 0
            else:
                vx2 += dvx2
            if abs(vy2) <= abs(dvy2):
                vy2 = 0
            else:
                vy2 += dvy2
            p2.velocity = vx2, vy2

        vx, vy = ball.velocity

        v = sqrt(vx*vx + vy*vy)

        if v != 0:
            dvx = at_ball*dt * abs(vx)/v
            dvy = at_ball*dt * abs(vy)/v

            if vx > 0:
                dvx *= -1
            if vy > 0:
                dvy *= -1

            if abs(vx) <= abs(dvx):
                vx = 0
            else:
                vx += dvx
            if abs(vy) <= abs(dvy):
                vy = 0
            else:
                vy += dvy
            ball.velocity = vx, vy

        space.step(dt)
        data = json.dumps([
            {'type': 'ball', 'x': ball.position[0], 'y': ball.position[1]},
            {'type': 'player', 'id': 'p1', 'x': p1.position[0], 'y': p1.position[1]},
            {'type': 'player', 'id': 'p2', 'x': p2.position[0], 'y': p2.position[1]}
        ])
        t = dt - (time() - t1)
        if t > 0: sleep(t)

t = Thread(target=physics_loop)
t.start()

async def handle_player(socket, F, taken):
    global p1_is_taken, p2_is_taken
    recv_task = asyncio.create_task(socket.recv())
    send_task = asyncio.create_task(socket.send(data))
    try:
        while True:  
            await asyncio.wait([send_task, recv_task], return_when=asyncio.FIRST_COMPLETED)
            if send_task.done():
                send_task = asyncio.create_task(socket.send(data))
                await asyncio.sleep(0.01)
            if recv_task.done():
                direction = json.loads(recv_task.result())
                F[0] = direction['X']*10000
                F[1] = -direction['Y']*10000
                recv_task = asyncio.create_task(socket.recv())
    except:
        if taken == 'p1':
            p1_is_taken = False
        elif taken == 'p2':
            p2_is_taken = False
        clients.remove(socket)

async def handle_viewer(socket):
    global data
    try:
        while True:
            await socket.send(data)
            await asyncio.sleep(0.01)
    except:
        clients.remove(socket)

async def socket_handler(socket):
    global data, F_p1, F_p2, p1_is_taken, p2_is_taken
    F = None
    taken = ''
    if not p1_is_taken:
        p1_is_taken = True
        F = F_p1
        taken = 'p1'
    elif not p2_is_taken:
        p2_is_taken = True
        F = F_p2
        taken = 'p2'
    clients.append(socket)
    await socket.send(json.dumps({'type': 'score', 'score_1': score_1, 'score_2': score_2}))
    if taken != '':
        await handle_player(socket, F, taken)
    else:
        await handle_viewer(socket)

async def main():
    async with websockets.serve(socket_handler, '', 8000):
        await asyncio.Future()

try:
    asyncio.run(main())
except:
    pass

running = False