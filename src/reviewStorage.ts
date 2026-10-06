import AsyncStorage from '@react-native-async-storage/async-storage';
import {createVisualReviewStore} from './visualReviewQueue';
export const visualReviewStore=createVisualReviewStore(AsyncStorage);
