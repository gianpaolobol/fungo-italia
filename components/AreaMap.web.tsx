import React,{useEffect,useRef} from 'react';
import type {WebViewProps} from 'react-native-webview';
// Isolated document; only messages from this frame reach the native-compatible bridge.
export function WebView({source,onMessage,onError}:WebViewProps){
 const frame=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.source!==frame.current?.contentWindow||typeof event.data!=='string')return;onMessage?.({nativeEvent:{data:event.data}} as never);};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[onMessage]);
 const html=source&&'html'in source?source.html:'';
 const bridge='<script>window.ReactNativeWebView={postMessage:function(data){parent.postMessage(data,"*")}};<'+ '/script>';
 return <iframe ref={frame} title="Mappa delle aree" sandbox="allow-scripts" srcDoc={bridge+html} onError={()=>onError?.({} as never)} style={{width:'100%',height:'100%',border:0}}/>;
}
