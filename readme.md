# Casa de Apostas 
Este repositorio contem um sistema de gerenciamento de casas de apostas <br>
Feito como trabalho final da cadeira de Projeto de Banco de Dados

# Run
## Banco de dados
Para rodar o banco de dados, tenha instalado o postgresql,
no linux utilize o seguinte comando;
```
sudo su postgres
psql
CREATE DATABASE casa_apostas;
```
no windows abra o terminal do postgresql e digite
```
CREATE DATABASE casa_apostas;
```
Agora o banco de dados foi criado, rode 
`./src/sql/setup_bd.sql` para criar as tabelas e 
`./src/sql/insert_data.sql` para inserir dados nas tabelas

## Servidor
Instale o Node.JS navegue ate a pasta do server e rode o comando para instalar as dependencias
```
npm install
```

Com as dependencias instaladas, para iniciar o servidor utilize o comando
```
npm start
```

Existe um arquivo chamado `init.json` que contem as informacoes do banco de dados, para que seja possivel o servidor realizar a conexao, altere de acordo com suas configuracoes

