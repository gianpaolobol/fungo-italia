import {WebView as NativeWebView} from 'react-native-webview';
import app from '../app.json';
import type {AreaMapProps} from './AreaMap.types';
export function WebView({areas:_areas,...props}:AreaMapProps){
 return <NativeWebView {...props} applicationNameForUserAgent={'FungoItalia/'+app.expo.version+' (+https://gianpaolobol.github.io/fungo-italia/)'}/>;
}
