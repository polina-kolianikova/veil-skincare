import {createProductStory, mix, pose, smooth} from './product-story.js?v=8ddbbd74b26a50adcaeb17a481ca46ec3e0e417ed71d1da5121cd02bf650d225';
const story=document.querySelector('.story'),stage=document.querySelector('.scene');
const bottle=stage.querySelector('.image-object');
export function setProductVariant(value) {
 if (['calm','dew','restore'].includes(value)) stage.dataset.finish=value;
}
const positions=[[.70,.48,8,1],[.27,.51,-6,.92],[.73,.53,10,1.15],[.28,.51,-4,.96]];
createProductStory({story,stage,progressBar:document.querySelector('#story-progress'),chapterLabel:document.querySelector('#chapter-count'),paint({index,fraction,width,height,landscape,reduced,pointer}) {
 const a=positions[Math.min(index,3)],b=positions[Math.min(index+1,3)];
 const base=Math.min(width*.42,height*.6);
 bottle.style.width=`${base}px`;
 let x=mix(a[0],b[0],fraction)*width,y=mix(a[1],b[1],fraction)*height,scale=mix(a[3],b[3],fraction),opacity=1;
 let rotation=reduced?0:mix(a[2],b[2],fraction)+pointer*3;
 if(landscape){x=width*.75;y=height*.54;scale=.85;}
 pose(bottle,x,y,rotation,scale,opacity);
 stage.style.setProperty('--reveal',String(Math.sin((index+fraction)/3*Math.PI)*.13));
}});
document.documentElement.dataset.renderMode='photographic';
