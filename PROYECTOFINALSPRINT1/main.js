const dataDb = require('./readDb');
const { consoleCapture } = require('./read');

let saldoATM = 0;
let saldoDenominaciones =

    [
        {
            denominacion: 5000,
            cantidad: 0,
            valor: 0,
        },
        {
            denominacion: 10000,
            cantidad: 0,
            valor: 0,
        },
        {
            denominacion: 20000,
            cantidad: 0,
            valor: 0,
        },
        {
            denominacion: 50000,
            cantidad: 0,
            valor: 0,
        },
        {
            denominacion: 100000,
            cantidad: 0,
            valor: 0,
        }
    ];


let usuarioActivo =
{
    nombre: '',
    documento: '',
    tipo: ''
}

if (dataDb.length == 0) {
    console.log('Error cargando la base de usuarios');
    process.exit();
}

const main = async () => {
    while (true) {
        console.clear();
        console.log(`
        *********************************************
        * Hola sea bienvenido al cajero mágico MAKA *
        *********************************************
        `)

        if (!verificarSaldo()) {
            mensajeModoMantenimiento();
        }
        await Login();
        console.log(usuarioActivo);
        if (usuarioActivo.tipo == '1') {
            console.clear();
            await cargarBilletes();
        }
        else if (verificarSaldo()) {
            console.clear();
            await retiroCliente();

        }

    }
}

mensajeModoMantenimiento = () => {
    console.log("Cajero en mantenimiento, vuelva pronto 😉");
}




function verificarSaldo() {
    if (saldoATM > 0) {
        return true;
    }
    else {
        return false;
    }
}

async function actualizarSaldo() {
    saldoATM = 0;
    saldoDenominaciones.forEach(item => {
        saldoATM += item.valor;
    });
}

function limpiarUsuarioActivo() {
    usuarioActivo.nombre = '';
    usuarioActivo.documento = '';
    usuarioActivo.tipo = '';
}

async function Login() {
    console.log('Para salir del programa presione Ctrl+C');
    limpiarUsuarioActivo();
    let documento = await consoleCapture('Ingrese el documento: ');
    let clave = await consoleCapture('Ingrese la clave: ');
    let sucess = findUser(documento, clave);
    if (!sucess) {
        console.log('usuario invalido! 😬');
        await Login();
    }
}

function findUser(_documento, _clave) {
    let funcoperation = false;
    const result = dataDb.find(item => item.documento === _documento && item.clave === _clave);
    if (result != NaN && result != undefined) {
        usuarioActivo.nombre = result.nombre;
        usuarioActivo.documento = result.documento;
        usuarioActivo.tipo = result.tipo;
        funcoperation = true;
    }
    return funcoperation;
}

async function cargarBilletes() {
    console.log(`
    *******************
    * MAKA ADMIN PANEL*
    *******************
    
    Hola señor admnistrador, sea bienvenido a MAKA ATM!
    
    A continuación se van a adicionar billetes de todas las denominaciones 5.000,10.000,20.000,50.000 y 100.000 🤑
   
    `);
    let cinco = Number(await consoleCapture('Ingrese cantida de billetes de 5.000 a adicionar: '));
    let diez = Number(await consoleCapture('Ingrese cantida de billetes de 10.000 a adicionar: '));
    let veinte = Number(await consoleCapture('Ingrese cantida de billetes de 20.000 a adicionar: '));
    let cincuenta = Number(await consoleCapture('Ingrese cantida de billetes de 50.000 a adicionar: '));
    let cien = Number(await consoleCapture('Ingrese cantida de billetes de 100.000 a adicionar: '));
    await actualizarCantidadBilletes(cinco, diez, veinte, cincuenta, cien);

}
async function actualizarCantidadBilletes(cinco, diez, veinte, cincuenta, cien) {
    saldoDenominaciones[0].cantidad += cinco;
    saldoDenominaciones[0].valor = saldoDenominaciones[0].cantidad * 5000;
    saldoDenominaciones[1].cantidad += diez;
    saldoDenominaciones[1].valor = saldoDenominaciones[1].cantidad * 10000;
    saldoDenominaciones[2].cantidad += veinte;
    saldoDenominaciones[2].valor = saldoDenominaciones[2].cantidad * 20000;
    saldoDenominaciones[3].cantidad += cincuenta;
    saldoDenominaciones[3].valor = saldoDenominaciones[3].cantidad * 50000;
    saldoDenominaciones[4].cantidad += cien;
    saldoDenominaciones[4].valor = saldoDenominaciones[4].cantidad * 100000;
    await actualizarSaldo();
    await imprimirSaldos()
    let empty = await consoleCapture('Presione cualquier tecla para continuar ');
}

async function imprimirSaldos() {
    console.log(`
    Saldos del cajero MAKA:
    
    Denomicación    Cantidad
    5.000           ${saldoDenominaciones[0].cantidad}
    10.000          ${saldoDenominaciones[1].cantidad}
    20.000          ${saldoDenominaciones[2].cantidad}
    50.000          ${saldoDenominaciones[3].cantidad}
    100.000         ${saldoDenominaciones[4].cantidad}

    Monto total disponible en el cajero:
    ${saldoATM}
    `);
}

async function retiroCliente() {
    console.log(`
    **************************************
    * Operaciones  cajero mágico MAKA    *
    **************************************
    Señor(a): ${usuarioActivo.nombre}
    Tenga en cuenta que este cajero es mágico y regala dinero, por favor no saque más de lo que necesita 😌
    Los retiros deben ser en cifras multiplos de 5000
    `);
    await imprimirSaldos();
    let cantidadRetiro = Number(await consoleCapture('Ingrese el monto a retirar '));
    console.log('Procesando...');
    if (cantidadRetiro > saldoATM) {
        console.log('Cantidad solicitada, mayor a la disponible en el sistema 😒');
        let empty = await consoleCapture('Presione cualquier tecla para continuar ')
    }
    else {
        let saldoPendiente = cantidadRetiro;
        let saldoDenominacionesTemp = JSON.parse(JSON.stringify(saldoDenominaciones));
        saldoDenominacionesTemp.forEach(item => { item.cantidad = 0; item.valor = 0 });

        for (let index = 4; index >= 0; index--) {

            if (saldoDenominaciones[index].valor > 0) {

                var valor = saldoPendiente / saldoDenominaciones[index].denominacion;
                var cantBilletes = Math.trunc(valor);
                if (cantBilletes == 0) {
                    continue;
                }

                if (cantBilletes <= saldoDenominaciones[index].cantidad) {
                    saldoDenominacionesTemp[index].cantidad = cantBilletes;
                }
                else {
                    saldoDenominacionesTemp[index].cantidad = saldoDenominaciones[index].cantidad;
                }

                saldoDenominacionesTemp[index].valor = saldoDenominacionesTemp[index].cantidad * saldoDenominaciones[index].denominacion;
                saldoPendiente -= saldoDenominacionesTemp[index].valor;

            }
        }

        if (saldoPendiente == cantidadRetiro) {
            console.log('Lo sentimos mucho por el momento no es posible esta operación');
            return;
        }
        await imprimirPropuestaretiro(saldoDenominacionesTemp, saldoPendiente, cantidadRetiro);

        let respuesta = await consoleCapture('Desea realizar el retiro (S/N) ');

        if (respuesta == 'S') {
            await hacerRetiro(saldoDenominacionesTemp);
        }
    }
}

async function imprimirPropuestaretiro(saldoDenominacionesTemp, saldoPendiente, cantidadRetiro) {
    let cantidad = cantidadRetiro - saldoPendiente;
    console.log(`
    Propueta de retiro  cajero MAKA:
    
    Denomicación          Cantidad
    5.000                 ${saldoDenominacionesTemp[0].cantidad}
    10.000                ${saldoDenominacionesTemp[1].cantidad}
    20.000                ${saldoDenominacionesTemp[2].cantidad}
    50.000                ${saldoDenominacionesTemp[3].cantidad}
    100.000               ${saldoDenominacionesTemp[4].cantidad}
    Cantidad a retirar:   ${cantidad}
    Cantidad solicitada:  ${cantidadRetiro}
    Cantidad faltante:    ${saldoPendiente}
   `);
}
async function hacerRetiro(saldoDenominacionesTemp) {
    saldoDenominacionesTemp.forEach(
        (item, index) => {
            saldoDenominaciones[index].cantidad -= item.cantidad;
            saldoDenominaciones[index].valor = saldoDenominaciones[index].cantidad * saldoDenominaciones[index].denominacion;
        }
    );
    await actualizarSaldo();
    console.log(`
    Favor de retirar el dinero 🤑
    Muchas gracias por usar nuestro servicio!`);
    let empty = await consoleCapture('Presione cualquier tecla para continuar ');
}

main();

