import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { RiCloseFill } from 'react-icons/ri';
import MenuIcons from '../MenuIcons';

interface MenusProps {
    open?: boolean;
}
const MenuContainer = styled.div`
    margin: 0 1.6rem;
    width: 90%;
    display: flex;

    & ${MenuIcons}{
        position: fixed;
        right: 16px;
        top: 16px;
    }
    @media(min-width: 768px){
        align-items: center;
        justify-content: center;
    }
    @media(min-width: 1000px){
    }
`
const Menus = styled.nav`
    z-index: 1;
    width: 170px;
    height: 100vh;
    position: fixed;
    right: 0;
    top: 0;
    transform: ${(props: MenusProps) => props.open ? 'translateX(100%)' : 'translateX(0)'};
    transition: 0.3s;
    padding-top: 20px;
    
    ul{
        margin-left: 0;
        width: 100%;
        padding: 0;
    }
    ul li{
        max-width: 125px;
    }
    ul ul{
        display: none;
    }
    ul li:hover > ul{
        display: block;
    }
    @media(min-width: 768px){
        max-width: 560px;
        transform: none;
        display: flex;
        position: static;
        height: 100%;
        flex: 1;
        background-color: transparent;
        justify-content: space-between;  
    }
    @media(min-width: 1000px){
        min-width: 650px;
    }
`
const Lista = styled.li`
    color: white;
    display: flex;
    max-width: 190px;
    height: 70px;
    padding: 0;
    display: inline-block;
    text-align: initial;
    line-height: 70px;
    font-size: 16px;
    ul li:hover{
        transition: 0.3s;
    }
    @media(max-width: 1000px){
        max-width: 100px;
    }
`
const MenuList = styled.ul`
    list-style: none;
    margin-left: 2rem;
    margin-top: 1rem;
    padding: 0;
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    li ul li{
        background-color: var(--SubMenuFundo);
    }
    li 
    .MenuLink{
        color: var(--branco);
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 0;
    }
    @media(min-width: 768px){
        display: flex;
        justify-content: space-between;
        margin: 0;
        li{
            margin-right: 5px;
            margin-bottom: 0;
            color: var(--branco);
        }
    }
    @media(min-width: 768px){
        flex-direction: row;
    }
    @media(min-width: 1000px){
        margin: 0;
        max-width: 630px;
        li {
            margin-bottom: 0;
            font-size: 18px;
        }
        .MenuLink{
            color: var(--color-botao-texto);
        }
    }
`
export default function Menu() {

    const [open, setOpen] = useState(true);

    return (
        <MenuContainer>
            {open &&
                <MenuIcons open={open} onClick={() => setOpen(!open)}>
                    <FiMenu />
                </MenuIcons>
            }
            {!open &&
                <MenuIcons open={open} onClick={() => setOpen(!open)}>
                    <RiCloseFill />
                </MenuIcons>
            }
            <Menus open={open}>
                <MenuList>
                    <Lista><Link to="/coagulacao" className="MenuLink" >Coagulação</Link></Lista>
                    <Lista><Link to="/floculacao" className="MenuLink" >Floculação</Link></Lista>
                    <Lista><Link to="/decantacao" className="MenuLink" >Decantação</Link></Lista>
                    <Lista><Link to="/filtracao" className="MenuLink" >Filtração</Link></Lista>

                </MenuList>

            </Menus>
            

        </MenuContainer>
    );
}