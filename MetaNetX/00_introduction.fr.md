# Introduction

Les bases de données de réseaux métaboliques contiennent des métabolites qui agissent comme substrats et produits des réactions biochimiques. Cependant, il existe de nombreuses incohérences dans les noms ou les structures chimiques entre les différentes bases de données, ainsi que dans leurs références croisées.

L'algorithme MetaNetX harmonise les identifiants des entités chimiques en se basant sur les informations structurales, le contexte réactionnel et, dans une moindre mesure, sur les références croisées et les noms provenant des bases de données sources. **Dans MetaNetX, les métabolites sont définis comme des ensembles d'identifiants d'entités chimiques considérées comme équivalentes.**

Au sein d'un ensemble, les entités chimiques peuvent s'interconvertir via des réactions spontanées - telles que les réactions acido-basiques ou la tautomérie - qui se produisent spontanément en solution aqueuse (comme dans le métabolisme cellulaire). De plus, les entités participant à des réactions catalysées par des enzymes sont systématiquement affectées à des ensembles distincts et considérées comme des métabolites différents.

## Pourquoi identifier correctement les métabolites ?

En métabolomique, une même entité chimique peut posséder des dizaines d'identifiants différents selon la base de données utilisée. Sans harmonisation, deux analyses portant sur un même métabolite peuvent sembler impliquer des entités différentes - et inversement.

[MetaNetX](https://www.metanetx.org/) agrège les identifiants de **KEGG, ChEBI, HMDB, BiGG, SEED, VMH, MetaCyc, Rhea, SABIO-RK** et les regroupe en **ensembles (sets)** basés sur :

1. La structure chimique (MOL, SMILES, InChI)
2. Le contexte réactionnel
3. Les références croisées
4. Les noms

Chaque ensemble reçoit un identifiant `MNXM` unique. Cet identifiant est à utiliser pour la curation d'identifiants, mais **n'est pas considéré comme un identifiant stable à travers les versions de MetaNetX, il ne doit être utilisé que pour faire de la curation**. La relation entre ensembles est modélisée par `mnx:chemIsom` : un ensemble générique (ex. *alanine*, sans stéréochimie) pointe vers ses isomères spécifiques (ex. *L-alanine*, *D-alanine*).

```note
La version originale de ce tutoriel est un atelier R/Quarto plus complet de Florence Mehl (SIB) : [MetaNetX_metabolites_tutorial](https://github.com/sib-swiss/MetaNetX_metabolites_tutorial). Cette version exécute le SPARQL directement dans votre navigateur, sur un petit extrait réel des données de production de MetaNetX intégré dans chaque page, tiré de son point d'accès public [rdf.metanetx.org/sparql](https://rdf.metanetx.org/sparql).
```
