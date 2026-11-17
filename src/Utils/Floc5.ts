import { multiply, inv } from 'mathjs';
import { corrigirCamaras } from './flocCorrecao';

export default {
    floc(Q: number, Ttf: number, Nc: number, H: number, Nd: number, L: number, G1: number, G2: number, G3: number, G4: number, G5: number, FC: number) {
        var Tf = Ttf * 60;
        var am = [[1, 1, 1, 1, 1],
        [G1, -G2, 0, 0, 0],
        [0, G2, -G3, 0, 0],
        [0, 0, G3, -G4, 0],
        [0, 0, 0, G4, -G5]];

        var bm = [[Ttf], [0], [0], [0], [0]];


        var inve = inv(am);
        var rm1 = multiply(inve, bm);

        var rm = <any>[];
        rm = rm1;

        var t1 = rm[0];
        var t2 = rm[1];
        var t3 = rm[2];
        var t4 = rm[3];
        var t5 = rm[4];
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
        var nn4 = 0.045 * Math.pow((Math.pow((a * L * G4 / q), 2) * t4), (1 / 3));
        var n4 = Math.ceil(nn4);
        var nn5 = 0.045 * Math.pow((Math.pow((a * L * G5 / q), 2) * t5), (1 / 3));
        var n5 = Math.ceil(nn5);

        var e1 = L / n1;
        var e2 = L / n2;
        var e3 = L / n3;
        var e4 = L / n4;
        var e5 = L / n5;


        var V11 = q / (a * e1);
        var V21 = (2 / 3) * V11;

        var V12 = q / (a * e2);
        var V22 = (2 / 3) * V12;

        var V13 = q / (a * e3);
        var V23 = (2 / 3) * V13;

        var V14 = q / (a * e4);
        var V24 = (2 / 3) * V14;

        var V15 = q / (a * e5);
        var V25 = (2 / 3) * V15;

        var l1 = t1 * 60 * V11;
        var rh1 = a * e1 / (2 * (a + e1));
        var dhd1 = Math.pow(((q * 0.013) / ((a * e1) * Math.pow(rh1, (2 / 3)))), 2 )* l1;

        var l2 = t2 * 60 * V12;
        var rh2 = a * e2 / (2 * (a + e2));
        var dhd2 = Math.pow(((q * 0.013) / ((a * e2) * Math.pow(rh2, (2 / 3)))), 2) * l2;

        var l3 = t3 * 60 * V13;
        var rh3 = a * e3 / (2 * (a + e3));
        var dhd3 = Math.pow(((q * 0.013) / ((a * e3) * Math.pow(rh3, (2 / 3)))), 2) * l3;

        var l4 = t4 * 60 * V14;
        var rh4 = a * e4 / (2 * (a + e4));
        var dhd4 = Math.pow(((q * 0.013) / ((a * e4) * Math.pow(rh4, (2 / 3)))), 2)* l4;

        var l5 = t5 * 60 * V15;
        var rh5 = a * e5 / (2 * (a + e5));
        var dhd5 = Math.pow(((q * 0.013) / ((a * e5) * Math.pow(rh5, (2 / 3)))), 2)* l5;

        var dhl1 = ((n1 * (Math.pow(V11, 2)) + (n1 - 1) * (Math.pow(V21, 2)))) / (2 * 9.81);
        var dhl2 = ((n2 * (Math.pow(V12, 2))) + ((n2 - 1) * (Math.pow(V22, 2)))) / (2 * 9.81);
        var dhl3 = ((n3 * (Math.pow(V13, 2))) + ((n3 - 1) * (Math.pow(V23, 2)))) / (2 * 9.81);
        var dhl4 = ((n4 * (Math.pow(V14, 2))) + ((n4 - 1) * (Math.pow(V24, 2)))) / (2 * 9.81);
        var dhl5 = ((n5 * (Math.pow(V15, 2))) + ((n5 - 1) * (Math.pow(V25, 2)))) / (2 * 9.81);

        var dh1 = dhd1 + dhl1;
        var dh2 = dhd2 + dhl2;
        var dh3 = dhd3 + dhl3;
        var dh4 = dhd4 + dhl4;
        var dh5 = dhd5 + dhl5;

        var Gg1 = Math.sqrt((9.81 * dh1) / (Math.pow(10, -6) * t1 * 60));
        var Gg2 = Math.sqrt((9.81 * dh2) / (Math.pow(10, -6) * t2 * 60));
        var Gg3 = Math.sqrt((9.81 * dh3) / (Math.pow(10, -6) * t3 * 60));
        var Gg4 = Math.sqrt((9.81 * dh4) / (Math.pow(10, -6) * t4 * 60));
        var Gg5 = Math.sqrt((9.81 * dh5) / (Math.pow(10, -6) * t5 * 60));

        var M1 = [[n1, n2, n3, n4, n5], [e1, e2, e3, e4, e5], [V11, V12, V13, V14, V15], [V21, V22, V23, V24, V25], [dhd1, dhd2, dhd3, dhd4, dhd5], [dhl1, dhl2, dhl3, dhl4, dhl5], [dh1, dh2, dh3, dh4, dh5], [Gg1, Gg2, Gg3, Gg4, Gg5]];
        var M11 = M1;

        var M22 = corrigirCamaras(M1, [t1, t2, t3, t4, t5].map(Number), a, L, q, FC);
        var M2 = M22;

        return [M22, M2, M11, q, Vol, A, B, a];
    }
}