## Reglas

Siempre preoriza usar componentes del proyecto ya creados, en caso de que no existan, se pueden crear, pero siempre deben seguir la logica y diseño establecidos en el proyecto y crearlo dentro de la carpeta src\components\screens\components

Evita realizar cambios sustanciales en la logica del proyecto sin antes consultar con el usuario, el proyecto es sensible y cualquier cambio puede afectar el funcionamiento de todo el sistema.

No crees o instales nuevas dependencias sin antes consultar con el usuario.

Cuando vayas a realizar un cambio en el proyecto, antes de realizarlo, realiza una copia de seguridad del proyecto actual.

no mezcles logica js en el jsx, para eso simpre crea un utils.js

## Arquitectura de estilos

No coloques estilos ni css hardcodeado en el jsx, eso va en los modulos css


## Textos

Siempre crea un archivo constants.js donde metas todos lo textos y asi no colocarlos harcodeados en el componente
