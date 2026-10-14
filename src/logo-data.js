/** Reference reconstruction, not an official brand master.
 * Coordinates are shared by the live scene and offline renderer.
 * Replace these polygons with approved logo outlines before brand approval.
 */
export const logo = {
  source: 'Reconstructed from the supplied blueprint reference; official vector not supplied.',
  outline: [[-3,2.5],[2,2.5],[3,1.5],[3,-2.5],[-2,-2.5],[-3,-1.5]],
  depth: .36,
  parts: []
};
const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
// G is a continuous annular shape, including its horizontal return.
const g=[];
for(let i=0;i<=64;i++){const a=(50+i*310/64)*Math.PI/180;g.push([-1.58+.94*Math.cos(a),.94*Math.sin(a)]);}
g.push([-1.66,0],[-1.66,-.30],[-1.03,-.30]);
for(let i=0;i<=56;i++){const a=(-30-i*280/56)*Math.PI/180;g.push([-1.58+.60*Math.cos(a),.60*Math.sin(a)]);}
logo.parts.push({name:'G',points:g});
logo.parts.push({name:'E',points:[[-.42,-.94],[.77,-.94],[.77,-.59],[-.04,-.59],[-.04,-.17],[.63,-.17],[.63,.17],[-.04,.17],[-.04,.59],[.77,.59],[.77,.94],[-.42,.94]]});
logo.parts.push({name:'N',points:[[1.03,-.94],[1.41,-.94],[1.41,.28],[2.24,-.94],[2.64,-.94],[2.64,.94],[2.26,.94],[2.26,-.28],[1.43,.94],[1.03,.94]]});
// Structural members become these centerlines during assembly.
export const strokes=[];
const add=(a,b,width=.31)=>strokes.push({a,b,width});
for(let i=0;i<18;i++){const a=(50+i*310/18)*Math.PI/180,b=(50+(i+1)*310/18)*Math.PI/180;add([-1.58+.77*Math.cos(a),.77*Math.sin(a)],[-1.58+.77*Math.cos(b),.77*Math.sin(b)],.32);}
add([-1.65,-.15],[-.84,-.15],.30);
add([-.23,-.78],[-.23,.78],.38);
for(const y of [-.765,0,.765])add([-.23,y],[.60,y],.35);
add([1.22,-.77],[1.22,.77],.38);add([1.27,.75],[2.40,-.75],.36);add([2.45,-.77],[2.45,.77],.38);
for(let i=0;i<logo.outline.length;i++)add(logo.outline[i],logo.outline[(i+1)%logo.outline.length],.075);
