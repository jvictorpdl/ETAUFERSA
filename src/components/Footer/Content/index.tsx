import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 24px 16px;
    text-align: center;
    font-size: 0.9rem;
`
export default function FooterContent() {
    return (
        <FooterContainer>
            <p>ETA UFERSA: pré-dimensionamento de unidades de estação de tratamento de água</p>
            <p>Universidade Federal Rural do Semi-Árido (UFERSA)</p>
        </FooterContainer>
    );
}