import AsyncStorage from '@react-native-async-storage/async-storage';
import {createStudyStore} from './study-store.mjs';
export const studyStore=createStudyStore(AsyncStorage);
