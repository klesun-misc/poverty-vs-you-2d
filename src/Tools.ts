

type color_t = [number,number,number];

export class Tls
{
    static lim = (n: number, l: number, r: number) => Math.min(Math.max(n, l), r);

    // decreases the vector x length by dx
    // returns zero if sign changed
    static toZero = (vx: number,dvx: number) =>
        vx > 0 ? Math.max(0, vx - dvx) :
        vx < 0 ? Math.min(0, vx + dvx) :
            0;

    /** @param {Array} rgb1, rgb2, like [255,255,0] (yellow)
     *  @param {number} offset - a number from 0.0 to 1.0 */
    static getBetween = function(rgbStart: color_t, rgbEnd: color_t, offset: number)
    {
        offset = Math.min(offset, 1);
        offset = Math.max(offset, 0);

        var dr = offset * (rgbEnd[0] - rgbStart[0]) | 0;
        var dg = offset * (rgbEnd[1] - rgbStart[1]) | 0;
        var db = offset * (rgbEnd[2] - rgbStart[2]) | 0;

        return [rgbStart[0] + dr, rgbStart[1] + dg, rgbStart[2] + db];
    };
}

/** @return - sum of two vectors */
export var vadd = (vA: [number,number], vB: number[]): [number, number] => [vA[0] + vB[0], vA[1] + vB[1]];