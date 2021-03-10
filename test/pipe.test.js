const scrapyteer = require('../dist/index.js');

test('pipe functions s -> s', async () => {
    const f = await (scrapyteer.pipe(
        v => '['+v+']', 
        v => '{'+v+'}'
    ));

    const res = await f('hello');

    expect(res).toBe('{[hello]}');
});

test('pipe functions s -> a -> s', async () => {
    const f = await (scrapyteer.pipe(
        v => '['+v+']', 
        v => { 
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve("<"+v+">");
                }, 100);
            });
        },
        v => '{'+v+'}'
    ));

    const res = await f('hello');

    expect(res).toBe('{<[hello]>}');
});

test('pipe functions a -> s -> a', async () => {
    const f = await (scrapyteer.pipe(
        v => { 
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve("["+v+"]");
                }, 100);
            });
        },
        v => '<'+v+'>', 
        v => { 
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve("{"+v+"}");
                }, 100);
            });
        }
    ));

    const res = await f('hello');

    expect(res).toBe('{<[hello]>}');
});

test('pipe functions a -> a -> a', async () => {
    const f = await (scrapyteer.pipe(
        v => { 
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve("["+v+"]");
                }, 100);
            });
        },
        v => { 
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve("<"+v+">");
                }, 100);
            });
        },
        v => { 
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve("{"+v+"}");
                }, 100);
            });
        }
    ));

    const res = await f('hello');

    expect(res).toBe('{<[hello]>}');
});


test('pipe s -> Object', async () => {
    const res = await (scrapyteer.pipe(
        v => '['+v+']', 
        {
            prop1: v => '<'+v+'>',
            prop2: v => new Promise(resolve => { setTimeout(() => { resolve("{"+v+"}"); }, 100) }),
            prop3: 'hello'
        }
    ))('hello');

    expect(res).toEqual({
        prop1: '<[hello]>',
        prop2: '{[hello]}',
        prop3: 'hello'
    });
});


test('pipe s -> Object -> a', async () => {
    const res = await (scrapyteer.pipe(
        v => '['+v+']', 
        {
            prop1: v => '<'+v+'>',
            prop2: v => new Promise(resolve => { setTimeout(() => { resolve("{"+v+"}"); }, 100) }),
            prop3: 'hello'
        },
        obj => new Promise(resolve => { setTimeout(() => { obj['prop4'] = 'world'; resolve(obj); }, 100) })
    ))('hello');

    expect(res).toEqual({
        prop1: '<[hello]>',
        prop2: '{[hello]}',
        prop3: 'hello',
        prop4: 'world'
    });
});




test('pipe s -> Array -> a -> s', async () => {
    const res = await (scrapyteer.pipe(
        v => '['+v+']', 
        [
            v => '<'+v+'>',
            v => '{'+v+'}'
        ],
        v => { 
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve("%"+v+"%");
                }, 100);
            });
        },
        v => '('+v+')'
    ))('hello');

    expect(await scrapyteer.iteratorToArray(res)).toEqual([
        '(%<[hello]>%)',
        '(%{[hello]}%)'
    ]);
});


test('pipe () => Array -> s -> a -> s', async () => {
    const res = await (scrapyteer.pipe(
        () => ['hello', 'world'],
        v => '['+v+']', 
        v => { 
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve("<"+v+">");
                }, 100);
            });
        },
        v => '('+v+')'
    ))('hello');

    expect(await scrapyteer.iteratorToArray(res)).toEqual([
        '(<[hello]>)',
        '(<[world]>)'
    ]);
});