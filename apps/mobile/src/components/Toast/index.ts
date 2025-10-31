import ToastComponent from './Toast';
import { ToastStatic, staticMethods } from './staticMethods';

// Create the Toast object with static methods
const Toast = ToastComponent as typeof ToastComponent & ToastStatic;

// Attach static methods
Object.assign(Toast, staticMethods);

export default Toast;
export type { ToastStatic } from './staticMethods';
export { ToastProvider, useToast } from './ToastProvider';
export type * from './type';
