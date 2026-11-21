"""Regression checks with real Chrome input. Called by browser_smoke.py after page load."""

async def desktop(call,ev,wait,click,shot):
    # Begin on a normal model entry, not a test-only camera or page.
    await click('#reference'); await click('[data-entry="ark"]')
    probe='''(()=>{let s=document.querySelector('#sheet'),p=s.querySelector('.verse-block p'),a=s.getBoundingClientRect(),r=document.createRange();r.selectNodeContents(p);return [a.width,a.height,getComputedStyle(p).fontSize,r.getBoundingClientRect().height,devicePixelRatio,visualViewport.scale]})()'''
    bbox=await ev(probe)
    assert await ev("getComputedStyle(document.querySelector('#zoomIn')).visibility!=='hidden'"),'reader hides the model zoom buttons'
    assert await ev("en.rect().right<=document.querySelector('#sheet').getBoundingClientRect().left+1"),'reader covers the model'
    await click('#goObject');await wait('!en.transition');await shot('14-约柜与施恩座')
    await click('#reference');await click('[data-entry="ark"]');await wait('Math.abs(en.camera.aspect-en.rect().width/en.rect().height)<.005')
    bbox=await ev(probe)
    assert await ev("document.querySelector('#sheetBody').innerText.includes('高张翅膀')")
    async def center(selector):return await ev(f"(()=>{{const r=document.querySelector('{selector}').getBoundingClientRect();return {{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}}}})()")
    async def button(selector):
        pt=await center(selector)
        for action in ['mousePressed','mouseReleased']:await call('Input.dispatchMouseEvent',dict(type=action,button='left',clickCount=1,**pt))
    r0=await ev('en.radius');await button('#zoomIn');await wait(f'en.radius<{r0}');await button('#zoomOut');await wait(f'Math.abs(en.radius-{r0})<.001')
    await shot('15-模型与经文分栏'); p=await center('#world'); r=await ev('en.radius');
    for mod in [0,2]: # regular wheel and ctrl-wheel (Chrome trackpad pinch on the scene)
        await call('Input.dispatchMouseEvent',dict(type='mouseWheel',deltaY=-48,deltaX=0,modifiers=mod,**p));await wait(f'en.radius<{r}');r=await ev('en.radius');assert bbox==await ev(probe)
    await call('Input.dispatchMouseEvent',dict(type='mouseWheel',deltaY=320,deltaX=0,**await center('#sheetBody')));await wait("document.querySelector('#sheetBody').scrollTop>0");assert abs(await ev('en.radius')-r)<.0001 and bbox==await ev(probe)
    print('Desktop: panel [width, height, verse font, text height, DPR, page scale]',bbox,'unchanged; buttons, wheel and ctrl-wheel change only the camera. Reader wheel scrolls only verses.',flush=True)
    await click('#closeSheet');await click('#placesBtn');await click('[data-stop="keepers"]');await shot('16-院门台阶上的守门人');await click('#home');await wait('!en.transition');

async def touch(call,ev,wait,click):
    await click('#placesBtn');await click('[data-stop="ark"]');await wait('en.observing==="ark"&&!en.transition');await click('#reference');await ev("(()=>{const q=document.querySelector('#q');q.value='约柜与施恩座';q.dispatchEvent(new Event('input'))})()");await click('[data-entry="ark"]');await wait('Math.abs(en.camera.aspect-en.rect().width/en.rect().height)<.005');
    assert await ev("en.rect().bottom<=document.querySelector('#sheet').getBoundingClientRect().top+1"),'reader covers the mobile model'
    before=await ev("[visualViewport.scale,document.querySelector('#sheet').getBoundingClientRect().height,getComputedStyle(document.querySelector('.verse-block p')).fontSize]");rad=await ev('en.radius');pt=await ev('(()=>{const a=en.rect();return [a.x+a.width*.5,a.y+a.height*.56]})()');x,y=pt
    pair=lambda d:[dict(x=x-d,y=y,id=1),dict(x=x+d,y=y,id=2)]
    await call('Input.dispatchTouchEvent',dict(type='touchStart',touchPoints=pair(23)));await call('Input.dispatchTouchEvent',dict(type='touchMove',touchPoints=pair(40)));await call('Input.dispatchTouchEvent',dict(type='touchEnd',touchPoints=[]));await wait(f'en.radius<{rad}');assert before==await ev("[visualViewport.scale,document.querySelector('#sheet').getBoundingClientRect().height,getComputedStyle(document.querySelector('.verse-block p')).fontSize]");print('390px touch: two-finger model zoom leaves reader and page scale unchanged.',flush=True);await click('#closeSheet')
