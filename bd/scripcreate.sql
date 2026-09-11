-- =====================================================
-- EASYCLINIC - BANCO DE DADOS COMPLETO
-- Compatível com MariaDB
-- =====================================================

-- Desativa temporariamente as verificações
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- APAGA O BANCO EXISTENTE
-- ATENÇÃO: isso apaga todas as tabelas e dados!
-- =====================================================

DROP DATABASE IF EXISTS `easyclinic`;

-- =====================================================
-- CRIA O BANCO
-- =====================================================

CREATE DATABASE `easyclinic`
CHARACTER SET utf8
COLLATE utf8_general_ci;

USE `easyclinic`;

-- =====================================================
-- TABELA: clinica
-- =====================================================

CREATE TABLE `clinica` (
    `cnpj` VARCHAR(14) NOT NULL,
    `nome` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`cnpj`)
) ENGINE = InnoDB;

-- =====================================================
-- TABELA: tag
-- =====================================================

CREATE TABLE `tag` (
    `idtag` INT NOT NULL auto_increment,
    `descricao` VARCHAR(45) NOT NULL,
    `clinica_cnpj` VARCHAR(14) NOT NULL,

    PRIMARY KEY (`idtag`),

    INDEX `fk_tag_clinica1_idx` (`clinica_cnpj`),

    CONSTRAINT `fk_tag_clinica1`
        FOREIGN KEY (`clinica_cnpj`)
        REFERENCES `clinica` (`cnpj`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- =====================================================
-- TABELA: plano
-- =====================================================

CREATE TABLE `plano` (
    `idplano` INT NOT NULL auto_increment,
    `descricao` VARCHAR(45) NOT NULL,
    `aplicadesconto` TINYINT NOT NULL,
    `valordesconto` FLOAT NOT NULL,
    `exonera` TINYINT NOT NULL,
    `clinica_cnpj` VARCHAR(14) NOT NULL,

    PRIMARY KEY (`idplano`),

    INDEX `fk_plano_clinica1_idx` (`clinica_cnpj`),

    CONSTRAINT `fk_plano_clinica1`
        FOREIGN KEY (`clinica_cnpj`)
        REFERENCES `clinica` (`cnpj`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- =====================================================
-- TABELA: pacientes
-- =====================================================

CREATE TABLE `pacientes` (
    `idpacientes` INT NOT NULL auto_increment,
    `nome` VARCHAR(45) NOT NULL,
    `cpf` VARCHAR(45) NULL,
    `telefone` VARCHAR(45),
    `email` VARCHAR(45) NOT NULL,
    `complemento` VARCHAR(45) NULL,
    `tag_idtag` INT NOT NULL,
    `plano_idplano` INT NOT NULL,
    `clinica_cnpj` VARCHAR(14) NOT NULL,

    PRIMARY KEY (`idpacientes`),

    INDEX `fk_pacientes_tag_idx` (`tag_idtag`),
    INDEX `fk_pacientes_plano1_idx` (`plano_idplano`),
    INDEX `fk_pacientes_clinica1_idx` (`clinica_cnpj`),

    CONSTRAINT `fk_pacientes_tag`
        FOREIGN KEY (`tag_idtag`)
        REFERENCES `tag` (`idtag`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,

    CONSTRAINT `fk_pacientes_plano1`
        FOREIGN KEY (`plano_idplano`)
        REFERENCES `plano` (`idplano`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,

    CONSTRAINT `fk_pacientes_clinica1`
        FOREIGN KEY (`clinica_cnpj`)
        REFERENCES `clinica` (`cnpj`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- =====================================================
-- TABELA: usuario
-- =====================================================

CREATE TABLE `usuario` (
    `idusuario` INT NOT NULL auto_increment,
    `usuario` VARCHAR(45) NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `tipo` TINYINT NOT NULL,
    `clinica_cnpj` VARCHAR(14) NOT NULL,

    PRIMARY KEY (`idusuario`),

    INDEX `fk_usuario_clinica1_idx` (`clinica_cnpj`),

    CONSTRAINT `fk_usuario_clinica1`
        FOREIGN KEY (`clinica_cnpj`)
        REFERENCES `clinica` (`cnpj`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- =====================================================
-- TABELA: doutor
-- =====================================================

CREATE TABLE `doutor` (
    `iddoutor` INT NOT NULL auto_increment,
    `nome` VARCHAR(45) NOT NULL,
    `especialidade` VARCHAR(45) NOT NULL,
    `clinica_cnpj` VARCHAR(14) NOT NULL,
    `documento` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`iddoutor`),

    INDEX `fk_doutor_clinica1_idx` (`clinica_cnpj`),

    CONSTRAINT `fk_doutor_clinica1`
        FOREIGN KEY (`clinica_cnpj`)
        REFERENCES `clinica` (`cnpj`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- =====================================================
-- TABELA: agenda
-- =====================================================

CREATE TABLE `agenda` (
    `idagenda` INT NOT NULL auto_increment,
    `datahora` DATETIME NOT NULL,
    `doutor_iddoutor` INT NOT NULL,
    `pacientes_idpacientes` INT NOT NULL,
    `clinica_cnpj` VARCHAR(14) NOT NULL,

    PRIMARY KEY (`idagenda`),

    INDEX `fk_agenda_doutor1_idx` (`doutor_iddoutor`),
    INDEX `fk_agenda_pacientes1_idx` (`pacientes_idpacientes`),
    INDEX `fk_agenda_clinica1_idx` (`clinica_cnpj`),

    CONSTRAINT `fk_agenda_doutor1`
        FOREIGN KEY (`doutor_iddoutor`)
        REFERENCES `doutor` (`iddoutor`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,

    CONSTRAINT `fk_agenda_pacientes1`
        FOREIGN KEY (`pacientes_idpacientes`)
        REFERENCES `pacientes` (`idpacientes`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,

    CONSTRAINT `fk_agenda_clinica1`
        FOREIGN KEY (`clinica_cnpj`)
        REFERENCES `clinica` (`cnpj`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- =====================================================
-- REATIVA AS CHAVES ESTRANGEIRAS
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TESTE: MOSTRA AS TABELAS CRIADAS
-- =====================================================

SHOW TABLES;

use easyclinic;

select * from usuario;
select * from clinica;



-- apagar o banco de dados:
-- drop database easyclinic;