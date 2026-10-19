// One SVG coordinate system keeps devices, signals and ports aligned at any width.
export function transportArt(visual, uid=visual) {
 const cable=visual==='cable',direct=visual==='direct';
 const suffix=cable?'-adb':direct?'-direct':'';
 const wire='M132 321V378Q132 398 152 398H290Q310 398 310 378V333Q310 323 323 323';
 const wifiSignal=x=>`<g class="wifi-signal" transform="translate(${x} 34)" fill="none" stroke="#426ed0" stroke-width="2.5" stroke-linecap="round"><g class="wifi-waves"><path class="wifi-ring wifi-ring-outer" d="M-22 0Q0 -18 22 0"/><path class="wifi-ring wifi-ring-middle" d="M-15 8Q0 -5 15 8"/><path class="wifi-ring wifi-ring-inner" d="M-8 16Q0 9 8 16"/></g><circle cx="0" cy="24" r="2.5" fill="#426ed0" stroke="none"/></g>`;
 return `<figure class="transport-figure"><svg class="transport-art" viewBox="0 0 760 435" role="img" aria-label="${cable?'USB cable from the phone bottom port to the laptop left-side port':'Matching wireless signals above an Android phone and Windows PC'}">
 <defs><clipPath id="crop-${uid}"><rect x="77" y="81" width="110" height="233" rx="4"/></clipPath></defs>
 <ellipse cx="380" cy="245" rx="350" ry="180" fill="#dfe8ff"/>
 ${cable?`<path class="transport-wire" d="${wire}" fill="none" stroke="#3a527c" stroke-width="5"/>`:`${wifiSignal(132)}${wifiSignal(513)}<text x="322.5" y="47" text-anchor="middle" fill="#4f6b9c" font-size="11">${direct?'DIRECT PAIRING':'SHARED WI-FI'}</text>`}
 <rect x="72" y="75" width="120" height="246" rx="8" fill="#818fa8" stroke="#4c607f"/><g clip-path="url(#crop-${uid})"><image href="./assets/app-android-phone${suffix}.svg" x="77" y="81" width="110" height="236" preserveAspectRatio="xMidYMin slice"/></g><circle cx="132" cy="79" r="2" fill="#070f1d"/>
 <rect x="338" y="115" width="350" height="200" rx="7" fill="#273144" stroke="#8295b4"/><image href="./assets/app-windows${suffix}.svg" x="345" y="123" width="336" height="185" preserveAspectRatio="xMidYMid meet"/><path d="M325 315H700L710 335H315Z" fill="#8799b5"/>
 ${cable?`<g class="transport-usb-hardware"><rect x="318" y="320" width="17" height="7" rx="2" fill="#21344f"/><rect x="125" y="316" width="14" height="17" rx="3" fill="#aab9d1"/><rect x="313" y="320" width="14" height="7" rx="2" fill="#bac8de"/></g><path class="usb-packet" d="${wire}" fill="none" stroke="#c9ddff" stroke-width="2.5" stroke-linecap="round"/>`:''}
 <text x="132" y="420" text-anchor="middle" fill="#465f8d" font-size="14">Android phone</text><text x="513" y="420" text-anchor="middle" fill="#465f8d" font-size="14">Windows PC</text>
 </svg><figcaption>${cable?'USB data connection':direct?'Direct wireless connection':'Wireless camera connection'}</figcaption></figure>`;
}
