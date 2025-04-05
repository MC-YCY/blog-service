// // 获取本机 IPv4 地址（排除内部网络）
// import * as os from 'node:os';
//
// export function getServerIp(): string {
//   const port = process.env.PORT;
//   const interfaces = os.networkInterfaces();
//   for (const interfaceName of Object.keys(interfaces)) {
//     const interfaceInfo = interfaces[interfaceName];
//     if (!interfaceInfo) return `http://localhost:${port}`;
//     for (const iface of interfaceInfo) {
//       if (iface.family === 'IPv4' && !iface.internal) {
//         return `http://${iface.address}:${port}`;
//       }
//     }
//   }
//   return `http://localhost:${port}`;
// }
// 获取本机 IPv4 地址（排除内部网络）
import * as os from 'node:os';

export function getServerIp(): string {
  const port = process.env.UPLOAD_PORT;
  const upload_ip = process.env.UPLOAD_IP;
  // const interfaces = os.networkInterfaces();
  // for (const interfaceName of Object.keys(interfaces)) {
  //   const interfaceInfo = interfaces[interfaceName];
  //   if (!interfaceInfo) return `http://localhost:${port}`;
  //   for (const iface of interfaceInfo) {
  //     if (iface.family === 'IPv4' && !iface.internal) {
  //       return `http://${iface.address}:${port}`;
  //     }
  //   }
  // }
  // let ip = `localhost`
  // if(upload_ip){
  //   ip = upload_ip
  // }
  // return `http://${ip}:${port}`;

  return `http://${upload_ip}:${port}`;
}
