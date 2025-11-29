import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import store from './store.ts'
import { Provider } from 'react-redux'
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
const options = {
    position: positions.BOTTOM_CENTER,
    timeout: 3000,
    offset: '30px',
    transition: transitions.SCALE
}

createRoot(document.getElementById("root")!).render(
    <AlertProvider template={AlertTemplate} {...options}>
        <Provider store={store}>
            <App />
        </Provider>
    </AlertProvider>
);
