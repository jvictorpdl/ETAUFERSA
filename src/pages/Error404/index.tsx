import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/ui/Layout';
import { Paragrafo, PageTitle } from '../../components/ui/estilos';

export default function Error404() {
    return (
        <Layout unidade="Página não encontrada">
            <PageTitle>Página não encontrada</PageTitle>
            <Paragrafo style={{ marginTop: 8 }}>
                O endereço não corresponde a nenhuma unidade. Escolha uma das abas acima ou volte para a <Link to="/coagulacao">Coagulação</Link>.
            </Paragrafo>
        </Layout>
    );
}
