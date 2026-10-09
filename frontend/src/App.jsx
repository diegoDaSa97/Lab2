import { useState } from "react";
import "./App.css";
import api from "./services/api";

function App() {
  const [vista, setVista] = useState("clientes");

  const [clientes, setClientes] = useState([]);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [errorClientes, setErrorClientes] = useState("");

  const [cuenta, setCuenta] = useState("");
  const [transacciones, setTransacciones] = useState([]);
  const [cargandoTransacciones, setCargandoTransacciones] = useState(false);
  const [errorTransacciones, setErrorTransacciones] = useState("");

  const [transferencia, setTransferencia] = useState({
    senderAccountNumber: "",
    receiverAccountNumber: "",
    amount: "",
  });

  const [mensajeTransferencia, setMensajeTransferencia] = useState("");
  const [errorTransferencia, setErrorTransferencia] = useState("");

  const consultarClientes = async () => {
    setCargandoClientes(true);
    setErrorClientes("");

    try {
      const respuesta = await api.get("/customers");
      setClientes(respuesta.data);
    } catch (error) {
      setErrorClientes(
        "No fue posible consultar los clientes. Verifica que el backend esté ejecutándose."
      );
    } finally {
      setCargandoClientes(false);
    }
  };

  const consultarTransacciones = async (event) => {
    event.preventDefault();

    if (!cuenta.trim()) {
      setErrorTransacciones("Ingresa un número de cuenta.");
      return;
    }

    setCargandoTransacciones(true);
    setErrorTransacciones("");
    setTransacciones([]);

    try {
      const respuesta = await api.get(
        `/transactions/${cuenta.trim()}`
      );

      setTransacciones(respuesta.data);
    } catch (error) {
      setErrorTransacciones(
        "No fue posible consultar las transacciones de esa cuenta."
      );
    } finally {
      setCargandoTransacciones(false);
    }
  };

  const actualizarCampoTransferencia = (event) => {
    const { name, value } = event.target;

    setTransferencia({
      ...transferencia,
      [name]: value,
    });
  };

  const realizarTransferencia = async (event) => {
    event.preventDefault();

    setMensajeTransferencia("");
    setErrorTransferencia("");

    if (
      !transferencia.senderAccountNumber ||
      !transferencia.receiverAccountNumber ||
      !transferencia.amount
    ) {
      setErrorTransferencia("Completa todos los campos.");
      return;
    }

    try {
      const datos = {
        senderAccountNumber: transferencia.senderAccountNumber,
        receiverAccountNumber: transferencia.receiverAccountNumber,
        amount: Number(transferencia.amount),
      };

      const respuesta = await api.post("/transactions", datos);

      setMensajeTransferencia(
        "Transferencia realizada correctamente."
      );

      console.log("Respuesta del backend:", respuesta.data);

      setTransferencia({
        senderAccountNumber: "",
        receiverAccountNumber: "",
        amount: "",
      });
    } catch (error) {
      const mensaje =
        error.response?.data ||
        "No fue posible realizar la transferencia.";

      setErrorTransferencia(String(mensaje));
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Aplicación Bancaria</h1>
      </header>

      <nav className="nav">
        <button
          onClick={() => setVista("clientes")}
          className={vista === "clientes" ? "active" : ""}
        >
          Consultar clientes
        </button>

        <button
          onClick={() => setVista("transferencia")}
          className={vista === "transferencia" ? "active" : ""}
        >
          Realizar transferencia
        </button>

        <button
          onClick={() => setVista("historial")}
          className={vista === "historial" ? "active" : ""}
        >
          Historial de transacciones
        </button>
      </nav>

      <main className="main">
        {vista === "clientes" && (
          <section className="card">
            <h2>Consultar clientes</h2>

            <button onClick={consultarClientes}>
              Cargar clientes
            </button>

            {cargandoClientes && <p>Cargando clientes...</p>}

            {errorClientes && (
              <p className="error">{errorClientes}</p>
            )}

            {clientes.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Número de cuenta</th>
                    <th>Saldo</th>
                  </tr>
                </thead>

                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.id}</td>
                      <td>{cliente.firstName}</td>
                      <td>{cliente.lastName}</td>
                      <td>{cliente.accountNumber}</td>
                      <td>{cliente.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {vista === "transferencia" && (
          <section className="card">
            <h2>Realizar transferencia</h2>

            <form onSubmit={realizarTransferencia}>
              <label>
                Cuenta de origen
                <input
                  type="text"
                  name="senderAccountNumber"
                  value={transferencia.senderAccountNumber}
                  onChange={actualizarCampoTransferencia}
                  placeholder="Número de cuenta de origen"
                />
              </label>

              <label>
                Cuenta de destino
                <input
                  type="text"
                  name="receiverAccountNumber"
                  value={transferencia.receiverAccountNumber}
                  onChange={actualizarCampoTransferencia}
                  placeholder="Número de cuenta de destino"
                />
              </label>

              <label>
                Valor a transferir
                <input
                  type="number"
                  name="amount"
                  value={transferencia.amount}
                  onChange={actualizarCampoTransferencia}
                  placeholder="Valor"
                  min="1"
                />
              </label>

              <button type="submit">
                Transferir dinero
              </button>
            </form>

            {mensajeTransferencia && (
              <p className="success">{mensajeTransferencia}</p>
            )}

            {errorTransferencia && (
              <p className="error">{errorTransferencia}</p>
            )}
          </section>
        )}

        {vista === "historial" && (
          <section className="card">
            <h2>Historial de transacciones</h2>

            <form onSubmit={consultarTransacciones}>
              <label>
                Número de cuenta
                <input
                  type="text"
                  value={cuenta}
                  onChange={(event) => setCuenta(event.target.value)}
                  placeholder="Ingresa el número de cuenta"
                />
              </label>

              <button type="submit">
                Consultar historial
              </button>
            </form>

            {cargandoTransacciones && (
              <p>Cargando transacciones...</p>
            )}

            {errorTransacciones && (
              <p className="error">{errorTransacciones}</p>
            )}

            {transacciones.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cuenta de origen</th>
                    <th>Cuenta de destino</th>
                    <th>Monto</th>
                  </tr>
                </thead>

                <tbody>
                  {transacciones.map((transaccion, index) => (
                    <tr key={transaccion.id || index}>
                      <td>{transaccion.id || "—"}</td>
                      <td>
                        {transaccion.senderAccountNumber || "—"}
                      </td>
                      <td>
                        {transaccion.receiverAccountNumber || "—"}
                      </td>
                      <td>{transaccion.amount || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!cargandoTransacciones &&
              !errorTransacciones &&
              cuenta &&
              transacciones.length === 0 && (
                <p>No se encontraron transacciones.</p>
              )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;