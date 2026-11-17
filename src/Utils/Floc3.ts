import { multiply, inv } from 'mathjs';
import { corrigirCamaras } from './flocCorrecao';

export default {
    floc(Q: number, Ttf: number, Nc: number, H: number, Nd: number, L: number, G1: number, G2: number, G3: number, FC: number) {

        var Tf = Ttf * 60;

        var am = [[1, 1, 1],
        [G1, -G2, 0],
        [0, G2, -G3]];

        var bm = [[Ttf], [0], [0]];

        var inve = inv(am);
        var rm1 = multiply(inve, bm);

        var rm = <any>[];
        rm = rm1;

        var t1 = rm[0];
        var t2 = rm[1];
        var t3 = rm[2];
        
        var q = Q / Nd;
        var Vol = q * Tf;
        
        var A = Vol / H;

        var B = A / L;
        var a = B / Nc;

        var nn1 = 0.045 * Math.pow((Math.pow((a * L * G1 / q), 2) * t1), (1 / 3));
        var n1 = Math.ceil(nn1);
        var nn2 = 0.045 * Math.pow((Math.pow((a * L * G2 / q), 2) * t2), (1 / 3));
        var n2 = Math.ceil(nn2);
        var nn3 = 0.045 * Math.pow((Math.pow((a * L * G3 / q), 2) * t3), (1 / 3));
        var n3 = Math.ceil(nn3);

        var e1 = L / n1;
        var e2 = L / n2;
        var e3 = L / n3;

        var V11 = q / (a * e1);
        var V21 = (2 / 3) * V11;

        var V12 = q / (a * e2);
        var V22 = (2 / 3) * V12;

        var V13 = q / (a * e3);
        var V23 = (2 / 3) * V13;

        var l1 = t1 * 60 * V11;
        var rh1 = a * e1 / (2 * (a + e1));
        var dhd1 = Math.pow(((q * 0.013) / ((a * e1) * Math.pow(rh1, (2 / 3)))), 2) * l1;

        var l2 = t2 * 60 * V12;
        var rh2 = a * e2 / (2 * (a + e2));
        var dhd2 = Math.pow(((q * 0.013) / ((a * e2) * Math.pow(rh2, (2 / 3)))), 2) * l2;

        var l3 = t3 * 60 * V13;
        var rh3 = a * e3 / (2 * (a + e3));
        var dhd3 = Math.pow(((q * 0.013) / ((a * e3) * Math.pow(rh3, (2 / 3)))), 2) * l3;

        var dhl1 = ((n1 * Math.pow(V11, 2)) + (n1 - 1) * (Math.pow(V21, 2))) / (2 * 9.81);
        var dhl2 = ((n2 * Math.pow(V12, 2)) + ((n2 - 1) * Math.pow(V22, 2))) / (2 * 9.81);
        var dhl3 = ((n3 * Math.pow(V13, 2)) + ((n3 - 1) * Math.pow(V23, 2))) / (2 * 9.81);

        var dh1 = dhd1 + dhl1;
        var dh2 = dhd2 + dhl2;
        var dh3 = dhd3 + dhl3;

        var Gg1 = Math.sqrt((9.81 * dh1) / (Math.pow(10, -6) * t1 * 60));
        var Gg2 = Math.sqrt((9.81 * dh2) / (Math.pow(10, -6) * t2 * 60));
        var Gg3 = Math.sqrt((9.81 * dh3) / (Math.pow(10, -6) * t3 * 60));

        var M1 = [[n1, n2, n3], [e1, e2, e3], [V11, V12, V13], [V21, V22, V23], [dhd1, dhd2, dhd3], [dhl1, dhl2, dhl3], [dh1, dh2, dh3], [Gg1, Gg2, Gg3]];
        var M11 = M1;
        var M22 = corrigirCamaras(M1, [t1, t2, t3].map(Number), a, L, q, FC);
        var M2 = M22;

        return [M22, M2, M11, q, Vol, A, B, a];
    }

}