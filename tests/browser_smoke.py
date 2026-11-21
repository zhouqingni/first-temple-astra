#!/usr/bin/env python3
"""Exercise the double-click file directly in isolated Chrome via CDP. Python websockets required only for this test."""
import asyncio, base64, json, os, pathlib, subprocess, tempfile, time, urllib.request
import websockets, detail_views
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'docs'/'预览'; OUT.mkdir(exist_ok=True)
CHROME=os.getenv('CHROME','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
async def test():
    profile=pathlib.Path(tempfile.mkdtemp(prefix='moriah-chrome-'))
    args=[CHROME,'--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-sync','--disable-extensions','--remote-debugging-port=0','--enable-unsafe-swiftshader','--user-data-dir='+str(profile),'--window-size=1280,810','about:blank']
    proc=subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    try:
        for _ in range(160):
            if (profile/'DevToolsActivePort').exists():break
            await asyncio.sleep(.1)
        port=(profile/'DevToolsActivePort').read_text().splitlines()[0]; tabs=json.load(urllib.request.urlopen('http://127.0.0.1:'+port+'/json/list'));tab=next(t for t in tabs if t['type']=='page');errors=[]; requests=[]; warnings=[]
        async with websockets.connect(tab['webSocketDebuggerUrl'],max_size=32*1024*1024) as ws:
            seq=0
            async def call(method,params=None):
                nonlocal seq
                seq+=1;q=seq;await ws.send(json.dumps({'id':q,'method':method,'params':params or {}}))
                while True:
                    msg=json.loads(await asyncio.wait_for(ws.recv(),75))
                    if msg.get('id')==q:
                        if 'error' in msg:raise RuntimeError(msg['error'])
                        return msg.get('result',{})
                    m=msg.get('method','');p=msg.get('params',{})
                    if m=='Runtime.exceptionThrown':errors.append(str(p.get('exceptionDetails'))[:1800])
                    elif m=='Runtime.consoleAPICalled' and p['type']=='error':errors.append(str(p.get('args'))[:2200])
                    elif m=='Log.entryAdded' and p['entry'].get('level')=='error':errors.append(p['entry'].get('text',''))
                    elif m=='Network.requestWillBeSent':requests.append(p['request']['url'])
            async def ev(exp):
                row=await call('Runtime.evaluate',dict(expression=exp,returnByValue=True,awaitPromise=True));
                if 'exceptionDetails' in row:raise RuntimeError(row['exceptionDetails'])
                return row['result'].get('value')
            async def wait(exp,seconds=30):
                start=time.monotonic()
                while not await ev(exp):
                    if errors or time.monotonic()-start>seconds:raise RuntimeError('timeout: '+exp+' '+str(errors))
                    await asyncio.sleep(.13)
            async def shot(name):
                await ev('document.querySelector("#toast").classList.remove("show")');await asyncio.sleep(.4); data=await call('Page.captureScreenshot',{'format':'jpeg','quality':90,'fromSurface':True});(OUT/(name+'.jpg')).write_bytes(base64.b64decode(data['data']))
            async def click(selector):await ev(f'document.querySelector({json.dumps(selector)}).click()')
            for domain in ['Page','Runtime','Log','Network']:await call(domain+'.enable')
            await call('Emulation.setDeviceMetricsOverride',dict(width=1280,height=810,deviceScaleFactor=1,mobile=False));await call('Page.navigate',{'url':(ROOT/os.getenv('MORIAH_ENTRY','index.html')).as_uri()});await wait('!!window.Moriah?.engine && Moriah.engine.renderer.info.render.frame>0',55);await ev('window.en=Moriah.engine;true');await shot('01-圣殿山全景');print('Loaded',await ev('({calls:en.renderer.info.render.calls,triangles:en.renderer.info.render.triangles,webgl2:en.renderer.capabilities.isWebGL2,gpu:(()=>{const g=en.renderer.getContext(),ex=g.getExtension("WEBGL_debug_renderer_info");return ex?g.getParameter(ex.UNMASKED_RENDERER_WEBGL):"unreported"})()})'),flush=True)
            await detail_views.desktop(call,ev,wait,click,shot)
            if os.getenv('MORIAH_DETAIL_ONLY'):return
            # Raycast, not a synthetic direct call to the reader: select the visible altar surface.
            async def cursor_on(p,kind='mouse'):
                c=await ev('(()=>{const p=en.project('+json.dumps(p)+'),r=en.rect();return [Math.round(p.x+r.left),Math.round(p.y+r.top)]})()');x,y=c
                if kind=='touch':
                    await call('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[dict(x=x,y=y)]});await call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
                else:
                    await call('Input.dispatchMouseEvent',dict(type='mouseMoved',x=x,y=y));
                    if not await ev('document.querySelector("#rulerBtn").getAttribute("aria-pressed")==="true"'):await wait('!document.querySelector("#hovercard").hidden',4)
                    await call('Input.dispatchMouseEvent',dict(type='mousePressed',x=x,y=y,button='left',clickCount=1));await call('Input.dispatchMouseEvent',dict(type='mouseReleased',x=x,y=y,button='left',clickCount=1))
            await click('#markBtn');await cursor_on([72,12.41,6]);await wait('document.querySelector("#sheetBody h2")?.textContent==="铜坛"');assert '长二十肘' in await ev('document.querySelector("#sheetBody").innerText');await click('#closeSheet');await click('#rulerBtn');await cursor_on([72,12.41,6]);await cursor_on([60,12.41,6]);assert '肘' in await ev('document.querySelector("#measureRead").textContent');await click('#rulerBtn');await click('#markBtn');await click('.dock [data-mode="cut"]');await wait('en.mode==="cut"&&!en.transition');await shot('02-殿宇剖视');await click('#reference');await ev('let q=document.querySelector("#q");q.value="铜海";q.dispatchEvent(new Event("input"))');await click('[data-entry="sea"]');assert '二千罢特' in await ev('document.querySelector("#sheetBody").innerText');assert '三千罢特' in await ev('document.querySelector("#sheetBody").innerText');await click('#goObject');await wait('!en.transition');await shot('03-铜海');await click('#placesBtn');await click('[data-stop="nave"]');await wait('en.mode==="orbit"&&en.observing==="nave"');await shot('04-外殿');
            await click('#placesBtn');await click('[data-stop="veil"]');await wait('en.observing==="veil"');await shot('09-整幅幔子');await cursor_on([-8.98,11.9,0]);await wait('document.querySelector("#sheetBody h2")?.textContent==="至圣所的幔子"');assert '绣出基路伯' in await ev('document.querySelector("#sheetBody").innerText');await click('#closeSheet');await click('#riteBtn');await click('[data-rite="feast"]');await shot('10-来守节的一家人');await cursor_on([92,2.70,13]);await wait('document.querySelector("#sheetBody h2")?.textContent==="来守节的男子"');await click('#closeSheet');await click('#riteBtn');await click('[data-person-view="chief"]');await shot('11-大祭司的礼服');await cursor_on([55.9,5.02,-14.4]);await wait('document.querySelector("#sheetBody h2")?.textContent==="穿以弗得的大祭司"');await click('#closeSheet');await click('#riteBtn');await click('[data-person-view="offering"]');await shot('12-晨祭预备');await click('#riteBtn');await click('[data-rite="atonement"]');await wait('en.world.rite==="atonement"&&en.observing==="atoning"');await shot('13-赎罪日幔内焚香');await cursor_on([-18.45,8.62,2.05]);await wait('document.querySelector("#sheetBody h2")?.textContent==="幔内焚香的大祭司"');await click('#closeSheet');await click('#riteBtn');await click('[data-person-view="veil"]');assert await ev('en.world.meshes.filter(m=>m.userData.layer==="veilClosed").every(m=>m.visible)');await click('#riteBtn');await click('[data-rite="study"]');await wait('en.mode==="walk"&&en.world.rite==="study"');start=await ev('({...en.player})');await call('Input.dispatchKeyEvent',dict(type='keyDown',key='w',code='KeyW',windowsVirtualKeyCode=87));await asyncio.sleep(.45);await call('Input.dispatchKeyEvent',dict(type='keyUp',key='w',code='KeyW',windowsVirtualKeyCode=87));end=await ev('({...en.player})');assert start!=end,(start,end)
            await click('#placesBtn');await click('[data-stop="oracle"]');await shot('05-至圣所');await click('#riteBtn');await click('[data-rite="feast"]');await click('#notes');await click('[data-tall="0"]');assert await ev('!en.world.tall');await click('#closeSheet');await click('#home');await wait('!en.transition');await shot('06-齐殿高示意');await click('#notes');await click('[data-tall="1"]');await click('#closeSheet');await wait('!en.transition');await call('Emulation.setDeviceMetricsOverride',dict(width=390,height=844,deviceScaleFactor=1,mobile=True));await call('Emulation.setTouchEmulationEnabled',dict(enabled=True,maxTouchPoints=5));await ev('en.home(true);true');await asyncio.sleep(.45);await shot('07-触屏全景');assert await ev('document.documentElement.scrollWidth===390');await click('#markBtn');await cursor_on([72,12.41,6],'touch');await wait('document.querySelector("#sheetBody h2")?.textContent==="铜坛" && !document.querySelector("#sheet").hidden');await shot('08-轻点查经');await click('#closeSheet');await click('.dock [data-mode="walk"]');await wait('en.mode==="walk"');assert await ev('getComputedStyle(document.querySelector("#joystick")).display!=="none"');j=await ev('(()=>{let r=document.querySelector("#joystick").getBoundingClientRect();return [r.x+r.width/2,r.y+10]})()');before=await ev('en.player.x');await call('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[dict(x=j[0],y=j[1])]});await asyncio.sleep(.55);await call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});after=await ev('en.player.x');assert after<before,(before,after)
            await click('#riteBtn');await click('[data-rite="atonement"]');await cursor_on([-18.45,8.62,2.05],'touch');await wait('!document.querySelector("#sheet").hidden&&document.querySelector("#sheetBody h2")?.textContent==="幔内焚香的大祭司"')
            await click('#closeSheet');await detail_views.touch(call,ev,wait,click)
            assert not [u for u in requests if u.startswith(('http://','https://'))],requests;print('Feast & Atonement actors, opaque veil, text picking, two wardrobes, public vs teaching mode, architecture, WASD and 390px touch/joystick: PASS; network requests to the internet: 0',flush=True);assert not errors,errors
    finally:
        proc.terminate()
        try:proc.wait(timeout=6)
        except subprocess.TimeoutExpired:proc.kill();proc.wait()
if __name__=='__main__':asyncio.run(test())
