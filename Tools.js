var Ns = Ns || {};

Ns.lim = (n,r,l) => Math.min(Math.max(n, l || -r), r);

// decreases the vector x length by dx
Ns.toZero = (vx,dvx) =>
    vx > 0 ? Math.max(0, vx - dvx) :
    vx < 0 ? Math.min(0, vx + dvx) :
    0;

/** @param {Array} rgb1, rgb2, like [255,255,0] (yellow)
 *  @param {number} offset - a number from 0.0 to 1.0 */
Ns.getBetween = function(rgbStart, rgbEnd, offset)
{
    offset = Math.min(offset, 1);
    offset = Math.max(offset, 0);

    var dr = offset * (rgbEnd[0] - rgbStart[0]) | 0;
    var dg = offset * (rgbEnd[1] - rgbStart[1]) | 0;
    var db = offset * (rgbEnd[2] - rgbStart[2]) | 0;

    return [rgbStart[0] + dr, rgbStart[1] + dg, rgbStart[2] + db];
};
