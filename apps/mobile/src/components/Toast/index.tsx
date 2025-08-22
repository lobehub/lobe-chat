import ToastComponent from './Toast';
import { staticMethods, ToastStatic } from './staticMethods';

// Create the Toast object with static methods
const Toast = ToastComponent as typeof ToastComponent & ToastStatic;

// Attach static methods
Object.assign(Toast, staticMethods);

export default Toast;
export { ToastProvider, useToast } from './ToastProvider';
