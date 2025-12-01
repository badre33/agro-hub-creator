import { Product } from "@/components/ProductCard";
import placeholderImg from "@/assets/product-placeholder.jpg";

// Import des images de légumes
import artichaud from "@/assets/vegetables/artichaud.jpg";
import artichaudBeldi from "@/assets/vegetables/artichaud-beldi.jpg";
import asperge from "@/assets/vegetables/asperge.jpg";
import aubergine from "@/assets/vegetables/aubergine.jpg";
import cardon from "@/assets/vegetables/cardon.jpg";
import champignon from "@/assets/vegetables/champignon.jpg";
import chouFleure from "@/assets/vegetables/chou-fleure.jpg";
import chouRouge from "@/assets/vegetables/chou-rouge.jpg";
import chouVert from "@/assets/vegetables/chou-vert.jpg";
import courgette from "@/assets/vegetables/courgette.jpg";
import endive from "@/assets/vegetables/endive.jpg";
import epinard from "@/assets/vegetables/epinard.jpg";
import epinardPottes from "@/assets/vegetables/epinard-pottes.jpg";
import feve from "@/assets/vegetables/feve.jpg";
import haricotVert from "@/assets/vegetables/haricot-vert.jpg";
import navet from "@/assets/vegetables/navet.jpg";
import oignonRouge from "@/assets/vegetables/oignon-rouge.jpg";
import oignonVerte from "@/assets/vegetables/oignon-verte.jpg";
import petitPois from "@/assets/vegetables/petit-pois.jpg";
import poivronDouce from "@/assets/vegetables/poivron-douce.jpg";
import poivronRouge from "@/assets/vegetables/poivron-rouge.jpg";
import poivronVert from "@/assets/vegetables/poivron-vert.jpg";
import pommeDeTerreRt from "@/assets/vegetables/pomme-de-terre-pt.jpg";
import pommeDeTerreRouge from "@/assets/vegetables/pomme-de-terre-rouge.jpg";
import pommeDeTerre from "@/assets/vegetables/pomme-de-terre-frite.jpg";
import topinambour from "@/assets/vegetables/topinambour.jpg";
import betterave from "@/assets/vegetables/betterave.jpg";
import fenouil from "@/assets/vegetables/fenouil.jpg";
import oignon from "@/assets/vegetables/oignon.jpg";
import pommeDeTerreBlanche from "@/assets/vegetables/pomme-de-terre-blanche.jpg";

// Import des images de fruits
import ananas from "@/assets/fruits/ananas.jpg";
import avocat from "@/assets/fruits/avocat.jpg";
import bananeImporte from "@/assets/fruits/banane-importe.jpg";
import bananeLocal from "@/assets/fruits/banane-local.jpg";
import citron from "@/assets/fruits/citron.jpg";
import fraise from "@/assets/fruits/fraise.jpg";
import kaki from "@/assets/fruits/kaki.jpg";
import kiwi from "@/assets/fruits/kiwi.jpg";
import mangue from "@/assets/fruits/mangue.jpg";
import orangeClementine from "@/assets/fruits/orange-clementine.jpg";
import orangeNafel from "@/assets/fruits/orange-nafel.jpg";
import orangeJus from "@/assets/fruits/orange-jus.jpg";
import poire from "@/assets/fruits/poire.jpg";
import pommeImport from "@/assets/fruits/pomme-import.jpg";
import pommeLocalGrand from "@/assets/fruits/pomme-local-grand.jpg";
import pommeLocalMoyen from "@/assets/fruits/pomme-local-moyen.jpg";
import pommeDouce from "@/assets/fruits/pomme-douce.jpg";

// Import des images de salades
import bataviaRouge from "@/assets/salads/batavia-rouge.jpg";
import bataviaVerte from "@/assets/salads/batavia-verte.jpg";
import cheneVerte from "@/assets/salads/chene-verte.jpg";
import cheneRouge from "@/assets/salads/chene-rouge.jpg";
import celeriRave from "@/assets/salads/celeri-rave.jpg";
import germeAlfafa from "@/assets/salads/germe-alfafa.jpg";
import germeBetterave from "@/assets/salads/germe-betterave.jpg";
import germePoireau from "@/assets/salads/germe-poireau.jpg";
import iceberg from "@/assets/salads/iceberg.jpg";
import laitueRomain from "@/assets/salads/laitue-romain.jpg";
import laitueRouge from "@/assets/salads/laitue-rouge.jpg";
import laitueVerte from "@/assets/salads/laitue-verte.jpg";
import loloRouge from "@/assets/salads/lolo-rouge.jpg";
import mesclun from "@/assets/salads/mesclun.jpg";
import mache from "@/assets/salads/mache.jpg";
import pousseBetterave from "@/assets/salads/pousse-betterave.jpg";
import pousseEpinard from "@/assets/salads/pousse-epinard.jpg";
import roquette from "@/assets/salads/roquette.jpg";
import saladeFrise from "@/assets/salads/salade-frise.jpg";
import tomateCerise from "@/assets/salads/tomate-cerise.jpg";

// Import des images de herbes
import aneth from "@/assets/herbs/aneth.jpg";
import basilic from "@/assets/herbs/basilic.jpg";
import celeri from "@/assets/herbs/celeri.jpg";
import chiba from "@/assets/herbs/chiba.jpg";
import ciboulette from "@/assets/herbs/ciboulette.jpg";
import coriandre from "@/assets/herbs/coriandre.jpg";
import mauveDesBois from "@/assets/herbs/mauve-des-bois.jpg";
import menthe from "@/assets/herbs/menthe.jpg";
import persil from "@/assets/herbs/persil.jpg";
import romarin from "@/assets/herbs/romarin.jpg";
import thym from "@/assets/herbs/thym.jpg";

export interface ProductWithCategory extends Product {
  category: string;
}

export const allProducts: ProductWithCategory[] = [
  // Légumes
  { id: 1, name: "Artichaud", price: 10, image: artichaud, unit: "kg", category: "legumes" },
  { id: 2, name: "Artichaud Beldi", price: 9, image: artichaudBeldi, unit: "kg", category: "legumes" },
  { id: 3, name: "Asperge", price: 25, image: asperge, unit: "kg", category: "legumes" },
  { id: 4, name: "Aubergine", price: 5, image: aubergine, unit: "kg", category: "legumes" },
  { id: 5, name: "Broccoli", price: 6, image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&q=80", unit: "kg", category: "legumes" },
  { id: 6, name: "Cardon", price: 5, image: cardon, unit: "botte", category: "legumes" },
  { id: 7, name: "Carotte", price: 5, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80", unit: "kg", category: "legumes" },
  { id: 8, name: "Champignon", price: 20, image: champignon, unit: "kg", category: "legumes" },
  { id: 9, name: "Chou Fleure", price: 8, image: placeholderImg, unit: "kg", category: "legumes" },
  { id: 10, name: "Chou Rouge", price: 8, image: chouRouge, unit: "kg", category: "legumes" },
  { id: 11, name: "Chou Vert", price: 6, image: chouVert, unit: "kg", category: "legumes" },
  { id: 12, name: "Citrouille rouge", price: 8, image: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=800&q=80", unit: "kg", category: "legumes" },
  { id: 13, name: "Concombre", price: 8, image: "https://images.unsplash.com/photo-1589621316382-008455b857cd?w=800&q=80", unit: "kg", category: "legumes" },
  { id: 14, name: "Courgette", price: 5, image: courgette, unit: "kg", category: "legumes" },
  { id: 15, name: "Endive", price: 12, image: endive, unit: "kg", category: "legumes" },
  { id: 16, name: "Epinard", price: 5, image: epinard, unit: "kg", category: "legumes" },
  { id: 17, name: "Epinard Pottes", price: 5, image: epinardPottes, unit: "botte", category: "legumes" },
  { id: 18, name: "Fenouil", price: 5, image: fenouil, unit: "botte", category: "legumes" },
  { id: 19, name: "Fève", price: 7, image: feve, unit: "kg", category: "legumes" },
  { id: 20, name: "Haricot vert", price: 18, image: haricotVert, unit: "kg", category: "legumes" },
  { id: 21, name: "Navet", price: 7, image: navet, unit: "kg", category: "legumes" },
  { id: 22, name: "Oignon", price: 12, image: oignon, unit: "kg", category: "legumes" },
  { id: 23, name: "Oignon Rouge", price: 12, image: oignonRouge, unit: "kg", category: "legumes" },
  { id: 24, name: "Oignon Verte", price: 7, image: oignonVerte, unit: "kg", category: "legumes" },
  { id: 25, name: "Petit pois", price: 12, image: petitPois, unit: "kg", category: "legumes" },
  { id: 26, name: "Poivron Douce", price: 12, image: poivronDouce, unit: "kg", category: "legumes" },
  { id: 27, name: "Poivron Rouge", price: 6, image: poivronRouge, unit: "kg", category: "legumes" },
  { id: 28, name: "Poivron vert", price: 6, image: poivronVert, unit: "kg", category: "legumes" },
  { id: 29, name: "Pomme de terre Blanche", price: 6, image: placeholderImg, unit: "kg", category: "legumes" },
  { id: 30, name: "Pomme de terre Pt", price: 6, image: pommeDeTerreRt, unit: "kg", category: "legumes" },
  { id: 31, name: "Pomme de terre Rouge", price: 6, image: pommeDeTerreRouge, unit: "kg", category: "legumes" },
  { id: 32, name: "Pomme de terre frite", price: 6, image: placeholderImg, unit: "kg", category: "legumes" },
  { id: 33, name: "TOPINAMBOUR", price: 8, image: topinambour, unit: "kg", category: "legumes" },
  { id: 34, name: "Tomate", price: 6, image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&q=80", unit: "kg", category: "legumes" },
  { id: 35, name: "Betterave", price: 5, image: betterave, unit: "kg", category: "legumes" },

  // Fruits
  { id: 36, name: "Ananas", price: 15, image: ananas, unit: "kg", category: "fruits" },
  { id: 37, name: "Avocat", price: 20, image: avocat, unit: "kg", category: "fruits" },
  { id: 38, name: "Banane Importé", price: 12, image: bananeImporte, unit: "kg", category: "fruits" },
  { id: 39, name: "Banane Local", price: 10, image: bananeLocal, unit: "kg", category: "fruits" },
  { id: 40, name: "Citron", price: 8, image: citron, unit: "kg", category: "fruits" },
  { id: 41, name: "Fraise", price: 15, image: fraise, unit: "kg", category: "fruits" },
  { id: 42, name: "Kaki", price: 12, image: kaki, unit: "kg", category: "fruits" },
  { id: 43, name: "Kiwi", price: 15, image: kiwi, unit: "kg", category: "fruits" },
  { id: 44, name: "Mangue", price: 18, image: mangue, unit: "kg", category: "fruits" },
  { id: 45, name: "Orange Clementine", price: 8, image: orangeClementine, unit: "kg", category: "fruits" },
  { id: 46, name: "Orange Nafel", price: 8, image: orangeNafel, unit: "kg", category: "fruits" },
  { id: 47, name: "Orange à jus", price: 7, image: orangeJus, unit: "kg", category: "fruits" },
  { id: 48, name: "Poire", price: 12, image: poire, unit: "kg", category: "fruits" },
  { id: 49, name: "Pomme Import", price: 12, image: pommeImport, unit: "kg", category: "fruits" },
  { id: 50, name: "Pomme Local Calibre Grand", price: 10, image: pommeLocalGrand, unit: "kg", category: "fruits" },
  { id: 51, name: "Pomme Local Calibre Moyen", price: 9, image: pommeLocalMoyen, unit: "kg", category: "fruits" },
  { id: 52, name: "Pomme douce", price: 7, image: pommeDouce, unit: "kg", category: "fruits" },

  // Salades
  { id: 53, name: "Batavia Rouge", price: 5, image: bataviaRouge, unit: "pièce", category: "salades" },
  { id: 54, name: "Batavia Verte", price: 5, image: bataviaVerte, unit: "pièce", category: "salades" },
  { id: 55, name: "Chêne Verte", price: 6, image: cheneVerte, unit: "pièce", category: "salades" },
  { id: 56, name: "Chêne rouge", price: 6, image: cheneRouge, unit: "pièce", category: "salades" },
  { id: 57, name: "Céleri-rave", price: 7, image: celeriRave, unit: "kg", category: "salades" },
  { id: 58, name: "Germe Alfafa", price: 8, image: germeAlfafa, unit: "botte", category: "salades" },
  { id: 59, name: "Germe Betterave", price: 8, image: germeBetterave, unit: "botte", category: "salades" },
  { id: 60, name: "Germe Poireau", price: 8, image: germePoireau, unit: "botte", category: "salades" },
  { id: 61, name: "Iceberg", price: 5, image: iceberg, unit: "pièce", category: "salades" },
  { id: 62, name: "Laitue Romain", price: 5, image: laitueRomain, unit: "pièce", category: "salades" },
  { id: 63, name: "Laitue Rouge", price: 5, image: laitueRouge, unit: "pièce", category: "salades" },
  { id: 64, name: "Laitue Verte", price: 4, image: laitueVerte, unit: "pièce", category: "salades" },
  { id: 65, name: "Lolo Rouge", price: 6, image: loloRouge, unit: "pièce", category: "salades" },
  { id: 66, name: "Mesclun", price: 9, image: mesclun, unit: "botte", category: "salades" },
  { id: 67, name: "Mâche", price: 7, image: mache, unit: "botte", category: "salades" },
  { id: 68, name: "Pousse Betterave", price: 8, image: pousseBetterave, unit: "botte", category: "salades" },
  { id: 69, name: "Pousse Epinard", price: 8, image: pousseEpinard, unit: "botte", category: "salades" },
  { id: 70, name: "Roquette", price: 6, image: roquette, unit: "botte", category: "salades" },
  { id: 71, name: "Salade Frisé", price: 5, image: saladeFrise, unit: "pièce", category: "salades" },
  { id: 72, name: "Tomate Cerise", price: 12, image: tomateCerise, unit: "kg", category: "salades" },

  // Herbes
  { id: 73, name: "Aneth", price: 3, image: aneth, unit: "botte", category: "herbes" },
  { id: 74, name: "Basilic", price: 3, image: basilic, unit: "botte", category: "herbes" },
  { id: 75, name: "Celeri", price: 4, image: celeri, unit: "botte", category: "herbes" },
  { id: 76, name: "Chiba", price: 3, image: chiba, unit: "botte", category: "herbes" },
  { id: 77, name: "Ciboulette", price: 3, image: ciboulette, unit: "botte", category: "herbes" },
  { id: 78, name: "Coriandre", price: 2, image: coriandre, unit: "botte", category: "herbes" },
  { id: 79, name: "Mauve des Bois", price: 4, image: mauveDesBois, unit: "botte", category: "herbes" },
  { id: 80, name: "Menthe", price: 2, image: menthe, unit: "botte", category: "herbes" },
  { id: 81, name: "Persil", price: 2, image: persil, unit: "botte", category: "herbes" },
  { id: 82, name: "Romarin", price: 3, image: romarin, unit: "botte", category: "herbes" },
  { id: 83, name: "Thym", price: 3, image: thym, unit: "botte", category: "herbes" },
];
