
/** @debug */
var vlen = (v) => Math.sqrt(v
    .map(e => e * e)
    .reduce((a,b) => a + b));
var vnorm = (v) => v.map(e => e / vlen(v));

var Index = function(canvasEl)
{
    /** vector subtraction
     * @param [number,number][] vA, vB */
    var vlen = (v) => Math.sqrt(v
        .map(e => e * e)
        .reduce((a,b) => a + b));

    var vdot = (vA, vB) => vA
        .map((_,i) => vA[i] * vB[i])
        .reduce((a,b) => a + b);

    var vnorm = (v) => v.map(e => e / vlen(v));
    var vmult = (v,k) => v.map(e => e * k);
    var vadd = (vA, vB) => vA.map((_,i) => vA[i] + vB[i]);
    var vsubt = (vA, vB) => vA.map((_,i) => vA[i] - vB[i]);

    var range = (l,r) => new Array(r - l).fill().map((_,k) => k + l);

    var ball_t = {
        position: [5,-5],
        velocity: [1,-2],
        radius: 5,
        mass: 1
    };

    /** @see https://en.wikipedia.org/wiki/Coefficient_of_restitution */
    const RESTITUTION = 1;

    /** @param {ball_t} me
     * @param {ball_t} ball */
    var colliding = (me, ball) =>
        vlen(vsubt(me.position, ball.position))
            < me.radius + ball.radius;

    /** @param {ball_t} ball
     * @param {ball_t} me */
    var resolveCollision = function(me, ball)
    {
        /** @does not work - for some reason sometimes balls are speeden-up
         * on collision, but sometimes - slowed, even though RESTITUTION is 1 */

        // get the mtd
        var delta = vsubt(me.position, ball.position);
        var d = vlen(delta);
        // minimum translation distance to push balls apart after intersecting
        var mtd = vmult(delta, (me.radius + ball.radius -d)/d);

        // resolve intersection --
        // inverse mass quantities
        var im1 = 1 / me.mass;
        var im2 = 1 / ball.mass;

        // push-pull them apart based off their mass
        me.position = vadd(me.position, vmult(mtd, im1 / (im1 + im2)));
        ball.position = vsubt(ball.position, vmult(mtd, im2 / (im1 + im2)));

        // impact speed
        var v = vsubt(me.velocity, ball.velocity);
        var vn = vdot(v, vnorm(mtd));

        // sphere intersecting but moving away from each other already
        if (vn > 0.0) return;

        // collision impulse
        var i = (-(1.0 + RESTITUTION) * vn) / (im1 + im2);
        var impulse = vmult(mtd, i);

        console.log('was', me.velocity, impulse, mtd, i);

        // change in momentum
        me.velocity = vadd(me.velocity, vmult(impulse, im1 / 2));
        ball.velocity = vsubt(ball.velocity, vmult(impulse, im2 / 2));

        //me.velocity = vadd(me.velocity, vmult(impulse, im1 / 2)); /** @debug this "/ 2" was not present in original code */
        //ball.velocity = vsubt(ball.velocity, vmult(impulse, im2 / 2)); /** @debug this "/ 2" was not present in original code */

        console.log('became', me.velocity);

        console.log({
            delta: delta + '',
            d: d + '',
            mtd: mtd + '',
            im1: im1 + '',
            im2: im2 + '',
            v: v + '',
            vn: vn + '',
            i: i + '',
            impulse: impulse + '',
        });
    };

    var resolveCollision2 = function(a, b)
    {
        /** @does not work - for some reason sometimes balls are glued to each other */

        var collision = vsubt(a.position, b.position);
        var distance = vlen(collision);
        if (distance == 0.0) {
            collision = [1,0];
            distance = 1.0;
        }

        // Get the components of the velocity vectors which are parallel to the collision.
        // The perpendicular component remains the same for both fish
        collision = vmult(collision, 1 / distance);
        var aci = vdot(a.velocity, collision);
        var bci = vdot(b.velocity, collision);

        // Replace the collision velocity components with the new ones
        a.velocity = vadd(a.velocity, vmult(collision, bci - aci));
        b.velocity = vadd(b.velocity, vmult(collision, aci - bci));
    };

    // from an answer of http://stackoverflow.com/questions/9424459/calculate-velocity-and-direction-of-a-ball-to-ball-collision-based-on-mass-and-b
    var resolveCollision3 = function(me, obj) {

        var dt, mT, v1, v2, cr, sm,
            dn = vsubt(me.position, obj.position),
            sr = me.radius + obj.radius, // sum of radii
            dx = vlen(dn); // pre-normalized magnitude

        if (dx > sr) {
            return; // no collision
        }

        // sum the masses, normalize the collision vector and get its tangential
        sm = me.mass + obj.mass;
        dn = vnorm(dn);
        dt = dn.slice().reverse();

        // avoid double collisions by "un-deforming" balls (larger mass == less tx)
        // me is susceptible to rounding errors, "jiggle" behavior and anti-gravity
        // suspension of the object get into a strange state
        mT = vmult(dn, me.radius + obj.radius - dx);
        me.position = vadd(me.position, vmult(mT, obj.mass / sm));
        obj.position = vadd(obj.position, vmult(mT, -me.mass / sm));

        // me interaction is strange, as the CR describes more than just
        // the ball's bounce properties, it describes the level of conservation
        // observed in a collision and to be "true" needs to describe, rigidity,
        // elasticity, level of energy lost to deformation or adhesion, and crazy
        // values (such as cr > 1 or cr < 0) for stange edge cases obviously not
        // handled here (see: http://en.wikipedia.org/wiki/Coefficient_of_restitution)
        // for now assume the ball with the least amount of elasticity describes the
        // collision as a whole:
        //cr = Math.min(me.cr, obj.cr);
        cr = 1; // absolute elastic

        // cache the magnitude of the applicable component of the relevant velocity
        v1 = vlen(vmult(dn, vdot(me.velocity, dn)));
        v2 = vlen(vmult(dn, vdot(me.velocity, dn)));

        // maintain the unapplicatble component of the relevant velocity
        // then apply the formula for inelastic collisions
        me.velocity = vmult(dt, vdot(me.velocity, dt));
        me.velocity = vadd(me.velocity, vmult(dn, (cr * obj.mass * (v2 - v1) + me.mass * v1 + obj.mass * v2) / sm));

        // do me once for each object, since we are assuming collide will be called
        // only once per "frame" and its also more effiecient for calculation cacheing
        // purposes
        obj.velocity = vmult(dt, vdot(obj.velocity, dt));
        obj.velocity = vadd(obj.velocity,vmult(dn, (cr * me.mass * (v1 - v2) + obj.mass * v2 + me.mass * v1) / sm));
    };

    var {width: w, height: h} = canvasEl;
    var generateRandomBalls = () => range(0,20).map(i => {
        var r = Math.random() * 8 + 4;
        return {
            position: [
                Math.random() * (w - 2 * r) + r,
                Math.random() * (h - 2 * r) + r
            ],
            velocity: [
                Math.random() * 5,
                Math.random() * 5
            ],
            radius: r,
            mass: 100,
            color: range(0,3).map(i => Math.random() * 200 | 0),
            //mass: Math.PI * (r ** 2) * Math.random() * 0.9 + 0.1
        };
    });

    // just two balls that will instantly collide
    var generateDebugBalls = () => [
        {
            position: [100,100],
            velocity: [-0.5,0],
            radius: 10,
            mass: 1,
            color: [255,0,0],
        }, {
            position: [300,100],
            velocity: [-2,0],
            radius: 10,
            mass: 1,
            color: [0,255,0],
        }
    ];

    /** @param {ball_t[]} balls */
    var repaint = function(balls)
    {
        var ctx = canvasEl.getContext("2d");

        ctx.clearRect(0,0,9999,9999);

        balls.forEach(ball => {
            var [x,y] = ball.position;
            //ctx.strokeStyle = 'green';
            ctx.strokeStyle = 'rgb(' + ball.color.join(',') + ')';
            ctx.beginPath();
            ctx.arc(x,y,ball.radius,0,Math.PI*2,true);
            ctx.stroke();
        });
    };

    /** @param {ball_t} ball */
    var reflectWalls = function(ball)
    {
        var [x,y] = ball.position;
        var r = ball.radius;

        (x - r < 0) && (ball.velocity[0] = +Math.abs(ball.velocity[0]));
        (x + r > w) && (ball.velocity[0] = -Math.abs(ball.velocity[0]));
        (y - r < 0) && (ball.velocity[1] = +Math.abs(ball.velocity[1]));
        (y + r > h) && (ball.velocity[1] = -Math.abs(ball.velocity[1]));
    };

    var main = function()
    {
        var balls = generateRandomBalls();
        //var balls = generateDebugBalls();

        var nextFrame = function()
        {
            balls.forEach(b => {
                reflectWalls(b);
                b.position = vadd(b.position, b.velocity);
            });

            for (var i = 0; i < balls.length; ++i) {
                for (var j = i + 1; j < balls.length; ++j) {
                    if (colliding(balls[i], balls[j])) {
                        resolveCollision3(balls[i], balls[j]);
                    }
                }
            }

            repaint(balls);

            setTimeout(nextFrame, 40);
        };

        nextFrame();
    };

    main();
};