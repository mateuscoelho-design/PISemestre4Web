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
    `cnpj` INT NOT NULL auto_increment,
    `nome` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`cnpj`)
) ENGINE = InnoDB;

CREATE TABLE `servicos` (
    `idservico` INT NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(45) NOT NULL,
    `preco` float not null,
    `clinica_cnpj` INT NOT NULL,

    PRIMARY KEY (`idservico`),
    INDEX `fk_servico_clinica1_idx` (`clinica_cnpj`),

    CONSTRAINT `fk_servico_clinica1`
        FOREIGN KEY (`clinica_cnpj`)
        REFERENCES `clinica` (`cnpj`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- =====================================================
-- TABELA: tag
-- =====================================================

CREATE TABLE `tag` (
    `idtag` INT NOT NULL auto_increment,
    `descricao` VARCHAR(45) NOT NULL,
    `clinica_cnpj` INT NOT NULL,

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
    `clinica_cnpj` INT NOT NULL,

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
    `plano_idplano` INT NOT NULL,
    `clinica_cnpj` INT NOT NULL,

    PRIMARY KEY (`idpacientes`),

    INDEX `fk_pacientes_plano1_idx` (`plano_idplano`),
    INDEX `fk_pacientes_clinica1_idx` (`clinica_cnpj`),

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
    `clinica_cnpj` INT NOT NULL,

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
    `clinica_cnpj` INT NOT NULL,
    `documento` INT NOT NULL,

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
    `servico_idservico` INT NOT NULL,
    `clinica_cnpj` INT NOT NULL,

    PRIMARY KEY (`idagenda`),

    INDEX `fk_agenda_doutor1_idx` (`doutor_iddoutor`),
    INDEX `fk_agenda_servico1_idx` (`servico_idservico`),
    INDEX `fk_agenda_pacientes1_idx` (`pacientes_idpacientes`),
    INDEX `fk_agenda_clinica1_idx` (`clinica_cnpj`),

    CONSTRAINT `fk_agenda_doutor1`
        FOREIGN KEY (`doutor_iddoutor`)
        REFERENCES `doutor` (`iddoutor`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
	
    CONSTRAINT `fk_agenda_servico1`
        FOREIGN KEY (`servico_idservico`)
        REFERENCES `servicos` (`idservico`)
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

-- -----------------------------------------------------
-- Table `easyclinic`.`anaminese`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `easyclinic`.`anaminese` (
  `idanaminese` INT NOT NULL AUTO_INCREMENT,
  `queixas` VARCHAR(255) NULL,
  `historicoatual` VARCHAR(255) NULL,
  `doencaspreexistentes` VARCHAR(255) NULL,
  `medicamentos` VARCHAR(255) NULL,
  `alergias` VARCHAR(255) NULL,
  `cirurgiasanteriores` VARCHAR(255) NULL,
  `historicofamiliar` VARCHAR(255) NULL,
  `pacientes_idpacientes` INT NOT NULL,
  PRIMARY KEY (`idanaminese`),
  INDEX `fk_anaminese_pacientes1_idx` (`pacientes_idpacientes` ASC),
  CONSTRAINT `fk_anaminese_pacientes1`
    FOREIGN KEY (`pacientes_idpacientes`)
    REFERENCES `easyclinic`.`pacientes` (`idpacientes`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE `tagpaciente` (
    `id` INT NOT NULL auto_increment,
    `tag_idtag` int NOT NULL,
    `pacientes_idpacientes` INT NOT NULL,

    PRIMARY KEY (`id`),

    INDEX `fk_tagpaciente_tag1_idx` (`tag_idtag`),
    INDEX `fk_agenda_pacientes1_idx` (`pacientes_idpacientes`),

    CONSTRAINT `fk_tagpaciente_tag1_idx`
        FOREIGN KEY (`tag_idtag`)
        REFERENCES `tag` (`idtag`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,

    CONSTRAINT `fk_tagpacientes_pacientes1`
        FOREIGN KEY (`pacientes_idpacientes`)
        REFERENCES `pacientes` (`idpacientes`)
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