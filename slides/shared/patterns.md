# los 5 patterns de orquestación

| pattern | qué es | cuándo |
|---------|--------|--------|
| **debate** | un agente critica el trabajo de otro | calidad > velocidad |
| **fan-out** | varios agentes en paralelo, se juntan resultados | tareas independientes |
| **pipeline** | cadena secuencial, cada uno pasa al siguiente | pasos con orden claro |
| **supervisor** | un manager delega a especialistas | el default de producción 2026 |
| **swarm** | agentes peers que se coordinan solos | problemas abiertos |

---

## el dato que nadie te cuenta

Princeton NLP: un solo agente **igualó o superó** a sistemas
multi-agente en el **64%** de las tareas — con las mismas tools.

multi-agente: **+2.1 pts** de accuracy a **~2x** el costo.

---

## entonces, ¿cuándo multi-agente?

- puede ser más **caro**
- puede ser más **random**
- puede demorar **más**

no siempre. hay que saber **cuándo y cómo**.

el mejor pattern es el que matchea tu problema,
no el más sofisticado que puedas armar.

---

## critique pattern: empieza aquí

nunca aceptes el primer output.

1. el agente construye
2. otro agente (u otra conversación) **critica**
3. se corrige con la crítica
4. recién ahí revisas tú

ataca directo la randomness. es el pattern con mejor
retorno por esfuerzo — y por eso es el primero que aprenderás.
