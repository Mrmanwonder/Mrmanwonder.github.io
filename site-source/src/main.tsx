import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {heroPalette} from './heroPalette';
import './styles.css';
const root=document.getElementById('root')!;
root.style.setProperty('--hero-text',heroPalette.text);
root.style.setProperty('--hero-accent',heroPalette.accent);
root.style.setProperty('--hero-crest',heroPalette.crest);
root.style.setProperty('--hero-accent-rgb',heroPalette.accentRGB);
root.style.setProperty('--hero-crest-rgb',heroPalette.crestRGB);
createRoot(root).render(<React.StrictMode><App/></React.StrictMode>);
import './responsive.css';
import './endings.css';

import './motion-refinements.css';

import './around-you.css';
import './badges.css';

import './hero-dark.css';
import './masthead.css';
