window.onload = function () {

    //ancho_pagina y alto_pagina del lienzo
    var ancho_pagina = 1984;    //this.window.innerWidth;
    var alto_pagina = 1003; //this.window.innerHeight;

    //Componentes del motor
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Events = Matter.Events,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;

    //Creación del motor y el mundo
    var engine = Engine.create(),
        world = engine.world;

    //Creación del renderizado
    var render = Render.create({
        element: document.getElementById("lienzo"),
        engine: engine,
        options: {
            width: ancho_pagina,
            height: alto_pagina,
            background: 'lightblue',
            showAngleIndicator: false,
            wireframes: false
        }
    });

    //Arranca el render
    Render.run(render);

    //Arranca el motor
    var runner = Runner.create();
    Runner.run(runner, engine);

    //Control con el mouse
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    //Añadir dicho control al mundo
    World.add(world, mouseConstraint);
    //Sincronización del renderizado y el ratón
    render.mouse = mouse;



    this.confirm("Ajusta la resolución con ctrl+ o ctrl-");


    //muros
    var techo = Bodies.rectangle(ancho_pagina / 2, 0, ancho_pagina, 20, { isStatic: true });
    var suelo = Bodies.rectangle(ancho_pagina / 2, alto_pagina, ancho_pagina, 20, { isStatic: true });
    var muro1 = Bodies.rectangle(0, alto_pagina / 2, 20, alto_pagina, { isStatic: true });
    var muro2 = Bodies.rectangle(ancho_pagina, alto_pagina / 2, 20, alto_pagina, { isStatic: true });

    var muros = [techo, suelo, muro1, muro2];
    World.add(world, muros);




    //pirámide
    var suelo_piramide = Bodies.rectangle(ancho_pagina, alto_pagina / 1.5, 1200, 20, { isStatic: true });

    var piramide = Composites.pyramid(ancho_pagina / 1.5, alto_pagina / 1.4 / 2, 9, 4, 0, 0, function (x, y) {
        return Bodies.rectangle(x, y, 64, 64, {
            render: {
                sprite: {
                    texture: 'box.png'
                }
            }
        });
    });

    World.add(world, [suelo_piramide, piramide]);


    //péndulo
    var pendulo = Composites.newtonsCradle(ancho_pagina / 1.5, alto_pagina / 11, 5, 40, 200);
    World.add(world, pendulo);

    //Si queremos un movimiento de inicio
    /*Body.translate(pendulo.bodies[0], { x: -180, y: -100 });
    Body.translate(pendulo.bodies[1], { x: -180, y: -100 });*/


    //test fricción
    var caja = Bodies.rectangle(ancho_pagina / 2, alto_pagina / 8, 64, 64, {
        frictionAir: 0.001,
        render: {
            sprite: {
                texture: 'box.png'
            }
        }
    });
    var pluma = Bodies.rectangle(ancho_pagina / 2 + 90, alto_pagina / 8, 64, 64, {
        frictionAir: 0.1,
        render: {
            sprite: {
                texture: 'pluma.png'
            }
        }
    });

    World.add(world, [caja, pluma]);

    //Pelotas
    var pelota_goma = Bodies.circle(100, 150, 25, { restitution: 1.3 });
    var pelota_medicinal = Bodies.circle(160, 150, 25, { restitution: 0.4 });
    World.add(world, [pelota_goma, pelota_medicinal]);


    var rock = Bodies.polygon(470, 650, 8, 20, { density: 0.004 });
    var elastic = Constraint.create({
        pointA: { x: 470, y: 650 },
        bodyB: rock,
        stiffness: 0.05
    });

    World.add(engine.world, [rock, elastic]);

    Events.on(engine, 'afterUpdate', function () {
        if (mouseConstraint.mouse.button === -1 && (rock.position.x > 490 || rock.position.y < 630)) {
            rock = Bodies.polygon(470, 650, 7, 20, { density: 0.004 });
            World.add(engine.world, rock);
            elastic.bodyB = rock;
        }
    });



    //Tela

    var group = Body.nextGroup(true),
        particleOptions = { friction: 0.00001, collisionFilter: { group: group }, render: { visible: false } },
        constraintOptions = { stiffness: 0.06 },
        cloth = Composites.softBody(650, 100, 15, 12, 5, 5, false, 8, particleOptions, constraintOptions);

    for (var i = 0; i < 20; i++) {
        cloth.bodies[i].isStatic = true;
    }

    World.add(engine.world, cloth);



    //rmpas
    World.add(world, [
        Bodies.rectangle(400, 180, 280, 20, { isStatic: true, angle: Math.PI * 0.06 }),
        Bodies.rectangle(300, 70, 40, 40, { friction: 0.001 })
    ]);

    World.add(world, [
        Bodies.rectangle(400, 350, 280, 20, { isStatic: true, angle: Math.PI * 0.06 }),
        Bodies.rectangle(300, 250, 40, 40, { friction: 0.0005 })
    ]);

    World.add(world, [
        Bodies.rectangle(400, 520, 280, 20, { isStatic: true, angle: Math.PI * 0.06 }),
        Bodies.rectangle(300, 430, 40, 40, { friction: 0 })
    ]);



    //Pecera
    var pared_pecera = Bodies.rectangle(1375, 820, 20, 330);
    var suelo_pecera = Bodies.rectangle(ancho_pagina, alto_pagina / 1.2, 1200, 20, { isStatic: true });

    var agua = Composites.stack(1450, 700, 30, 6, 0, 0, function (x, y) {
        return Bodies.circle(x, y, Common.random(1, 4), { friction: 0.00001, restitution: 0.5, density: 0.001 });
    });
    World.add(world, [pared_pecera, suelo_pecera, agua]);

    /**
     * ELEMENTOS
     */


    console.log(window.innerWidth + " " + window.innerHeight);




}








