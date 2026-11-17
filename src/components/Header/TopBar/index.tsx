import React from 'react';
import styled from 'styled-components';
import Menu from '../Menu';

const TopBarContainer = styled.div`
    display: flex;
    align-items: center;
    background-color: var(--primaria-dark);
    min-height: 7rem;
    padding: 8px 0;
    justify-content: center;
`
export interface BannerProps{
    
}

export default function TopBar(){
    return(
        <TopBarContainer>
            <Menu />
        </TopBarContainer>
    );
}