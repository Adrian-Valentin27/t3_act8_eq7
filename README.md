# #  Dashboard de Gestión Posibles Premios para jugadores
---

## Integrantes del Equipo
**Gonzalez Valentin Adrian**
**Martinez Miguel Leonardo Daniel**

Este es un proyecto desarrollado en equipo utilizando **React** y **Vite**. La aplicación cuenta con un sistema de autenticación de usuarios conectado a una API y un panel de control (Dashboard) optimizado para la visualización y gestión de datos de jugadores con paginación integrada y un menú lateral animado.


---

##  Características Principales y Estructura

* **Autenticación (Login):** Validación de campos, manejo de errores y conexión a `DummyJSON`.
* **Seguridad de Sesión:** Uso de `localStorage` para guardar el token y los datos del usuario.
* **Tabla Dinámica:** Renderizado de una lista de jugadores mediante el método `.map()`.
* **Paginación Matemática:** Sistema que divide el arreglo original de jugadores en "páginas" de 7 elementos utilizando el método `.slice()`.
* **Sidebar Reactivo:** Menú lateral animado con transiciones CSS y manejado por estados (`useState`).

---

## Lógica Interna y Fragmentos de Código

A continuación, se detalla cómo implementamos las dos funciones principales del proyecto: **El Login** y **La Tabla de Datos**.

###  El Login y la Autenticación
Para el login, separamos la lógica de conexión a la API en un archivo independiente (`api/auth.js`) para mantener el código limpio. Usamos la API pública de DummyJSON.

**Flujo del Login:**
1. Capturamos los datos de los inputs usando variables de estado (`useState`).
2. Prevenimos que el formulario recargue la página con `e.preventDefault()`.
3. Enviamos los datos a la API. Si las credenciales son correctas, guardamos la información en el navegador (`localStorage`) y redirigimos al Dashboard usando `useNavigate()`.
---
## Conexión con la API de Inventario
Para que la aplicación funcione de verdad, conectamos el sistema con la API de Productos.

Adiós a los datos falsos: En lugar de inventar videojuegos o consolas en el código, ahora la aplicación hace una petición a la API al cargar la página.

Información en tiempo real: Traemos directamente los nombres de los juegos, las categorías (consolas, accesorios, preventas), los precios y el stock disponible al momento.

Operaciones completas: La interfaz quedó lista para comunicarse con la API tanto para mostrar la lista como para procesar los datos en el Dashboard.

Tuning Visual (Diseño y Estilo)
Nos pusimos en los zapatos del usuario y pulimos los detalles visuales, especialmente en la pantalla de entrada (Login) y el panel principal (Dashboard).

El misterio del Logo: Logramos que el logo se viera grande y llamativo sin que rompiera el diseño ni moviera los textos de su lugar. Usamos trucos visuales para que se adapte al espacio sin estirar las cajas de texto de forma rara.

Alineación Perfecta: Diseñamos un sistema de balance para que el título "Connect & Play" quede exactamente en el centro de la pantalla, con el logo acompañándolo elegantemente al lado izquierdo, logrando un aspecto super limpio.

Consistencia: Logramos que la experiencia desde que entras a la app (Login) hasta que estás administrando el inventario (Dashboard) se sienta como un producto terminado y uniforme.

Subida a Internet (Despliegue en VPS)
Compramos un servidor (un "Droplet") en DigitalOcean y mudamos la aplicación ahí para que cualquiera pueda entrar desde su navegador usando una dirección IP pública.

Comprimir el proyecto: Empaquetamos todo el código de React en una versión súper ligera y optimizada para internet (la carpeta dist).

Montar el Servidor Web (Nginx): Instalamos un programa llamado Nginx en el servidor, que funciona como el "mesero" que le entrega la página a las personas que nos visitan.

El truco de las rutas: Configuramos el servidor para que entienda las rutas internas de la aplicación. De esta forma, si alguien recarga la página directamente en la sección del Dashboard, el servidor sabe exactamente qué hacer y no arroja una pantalla de error.

Permisos de seguridad: Ajustamos los accesos del servidor para asegurarnos de que las imágenes, logos y estilos se lean al instante y sin restricciones extrañas.


---
LINK DE LA IP: http://198.199.120.58/t3_act8_eq07
---