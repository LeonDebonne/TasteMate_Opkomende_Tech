# TasteMate Overkoepelde Opdracht
## Introductie
De TasteMate is een product dat het gebruik van de koelkast voor visueel beperkte personen vergemakkelijkt. Het bestaat hoofdzakelijk uit twee onderdelen, namelijk een touchscreeninterface en een AI-assistent. Het eerste onderdeel wordt gebruikt door begeleiders en/of familieleden. Hierop wordt de inventaris van de koelkast bijgehouden. Deze inventaris kan vervolgens worden geraadpleegd door de AI-assistent, die nuttige informatie via text-to-speech doorgeeft aan de visueel beperkte persoon.
<p align="center"> 
<img src="/img/Eye_Candy.JPEG" width="100%">

Het eerste onderdeel wordt geactiveerd via een wake-upmechanisme. Dit maakt gebruik van een afstandssensor die, wanneer er een persoon voor de koelkast of de TasteMate staat, een signaal stuurt naar het touchscreen om in te schakelen. De interface wordt lokaal gehost en is ontworpen met FigmaMake.

Het tweede onderdeel werkt via een microfoon die luistert naar de vraag van de blinde of slechtziende persoon. Deze vraag wordt verwerkt door een AI-assistent die gekoppeld is aan Gemini. De AI-assistent raadpleegt vervolgens de informatie uit de interface en communiceert het antwoord via een luidspreker naar de gebruiker met behulp van text-to-speech.

## Hoe code opstarten?
De code is opgesplitst in twee delen: één deel voor de interface en het wake-upsysteem, en een ander deel voor de voice-assistent.
#### Interface en wake-up
Om dit deel te laten werken, is alle code uit de map webserver nodig, samen met het [python script](/code/wake_up/wake_up.py) uit de map wake_up. De code in de map webserver regelt zowel de frontendinterface als de backend-Pythonserver die de inventaris bijhoudt.

Om alles op te starten, moet het [startscript](/code/start_tastemate.sh) worden uitgevoerd. Hierdoor wordt bij het opstarten van de Raspberry Pi alles automatisch gestart.

Er is ook een poging gedaan om alles op de Raspberry pi te draaien. De code voor de assistent is hiervoor getweaked. Deze maakt gebruik van een PnP mic en een GERUI DFplayer mini speaker. De code([TasteMate_Raspberry.py](/code/assistent/TasteMate_Rpi.py)) apart lukt om te runnen op de pi maar, als alle verschillende onderdelen samen moeten runnen is de Raspberry pi overbelast. Het volledige systeem is dus niet gerealiseerd maar alle componenten werken wel individueel.

#### Voice-assistent
Voor de voice-assistent moet alleen de code uit [TasteMate.py](/code/assistent/TasteMate.py) worden uitgevoerd. Deze raadpleegt dan de andere stukken code in deze map.

## Validatie inputs
Hiervoor werd de [datasheet](/docs/Raspberry%20PI.pdf) van de Raspberry Pi geraadpleegd
### Afstandssensor
De afstandssensor wordt in het project gebruikt om te detecteren of er een persoon voor de koelkast staat. Deze sensor meet de afstand tot een bepaald object.
Voor het valideren van de aansluiting is gebruikgemaakt van de [datasheet](/docs/HCSR04.pdf). De opstelling bevat een Raspberry Pi, de sensor en vier jumpers.

<p align="center"> 
<img src="/img/Schema_Afstandssensor.png" width="50%">

De [code](/code/inputs/afstandssensor.py) maakt gebruik van de gpiozero library en de time library.

## Validatie outputs
Hiervoor werd de [datasheet](/docs/Raspberry%20PI.pdf) van de Raspberry Pi geraadpleegd
### Buzzer
De buzzer maakt een kort geluid om gebruikers te vertellen dat het scherm aan staat. Voor het valideren van de aansluiting is gebruik gemaakt van de [datasheet](/docs/Buzzer.pdf). De opstelling bevat een Raspberry Pi, de buzzer en twee jumpers.

<p align="center"> 
<img src="/img/Schema_Buzzer.png" width="50%">

De [code](/code/outputs/buzzer.py) maakt gebruik van de gpiozero library en de time library.

### Scherm
Het scherm toont de interface en kan gebruikt worden via touchscreen. Er wordt gebruik gemaakt van een 4.3 inch HDMI LCD. 
De opstelling bevat een Raspberry Pi, het scherm en een HDMI-kabel. De connectie gebeurt dus via de HDMI-kabel.
De [code](/code/outputs/scherm.py) maakt gebruik van de tkinter library

## Wake-up mechanisme
Het wake-upmechanisme maakt gebruik van de afstandssensor om te detecteren of er een persoon in de buurt is. Vervolgens geeft de sensor aan de Raspberry Pi door dat het scherm moet worden ingeschakeld en dat de buzzer moet afgaan. Op die manier krijgt de gebruiker zowel een visuele als auditieve aanwijzing dat het scherm actief is.
Wanneer er geen interactie meer is met het scherm of wanneer er niemand meer voor staat, schakelt het scherm na 10 seconden automatisch weer uit. De code volgt hierbij de volgende logica:

<p align="center"> 
<img src="/img/wakeup_flowchart.svg" width="100%">

### Arduino
Voor dit onderdeel is het de bedoeling om met Arduino een systeem te maken dat detecteert wanneer er een persoon voor de koelkast staat. Vervolgens moet het scherm worden ingeschakeld en krijgt de gebruiker een audiotrigger om aan te geven dat het scherm actief is.
Zolang de persoon voor het scherm gedetecteerd blijft, blijft het scherm ingeschakeld. Wanneer de persoon echter langer dan 10 seconden afwezig is, schakelt het scherm automatisch weer uit.
Er is gebruikgemaakt van verschillende Arduino-componenten, zoals een Arduino Uno, een afstandssensor, een lcd-scherm en een buzzer.
Het resultaat is op een snelle en eenvoudige manier gerealiseerd, zodat er zo weinig mogelijk tijd verloren ging aan het visueel uitwerken van iets dat voornamelijk dient om een concept te testen.
Hieronder is het Wokwi-schema van het Arduino-project te vinden. De code is beschikbaar onder [Arduino_Code](code/wake_up/Arduino_Code).

<p align="center"> 
<img src="/img/Schema_Wakeup.jpg" width="50%">

Deze test is uitgevoerd om de logica te testen binnen een gebruiksvriendelijker ecosysteem dan dat van de Raspberry Pi. Dit komt doordat we reeds een introductie tot Arduino hebben gekregen en hier al eerdere kennis over hadden verworven. Het uiteindelijke systeem maakt echter gebruik van een Raspberry Pi, aangezien deze de daadwerkelijke interface moet weergeven.

### Raspberry Pi
Dit onderdeel volgt dezelfde logica als de test met de Arduino. Hier en daar zijn echter enkele aanpassingen uitgevoerd om de workflow te optimaliseren. Deze aanpassingen bevinden zich voornamelijk in de vertragingen tussen scans en detecties.
Het systeem detecteert of er een persoon voor de koelkast staat. Wanneer er gedurende 10 seconden geen interactie meer is met het scherm, wordt het automatisch uitgeschakeld. Deze interactie wordt gemeten met behulp van de library pyautogui, die muis- en touchinteracties registreert.
Naast de library voor interactiemeting wordt ook gebruikgemaakt van de gpiozero-library. Deze dient voor het definiëren van de sensoren en actuatoren. Daarnaast worden ook de time- en subprocess-libraries gebruikt. Deze zorgen respectievelijk voor de tijdsvertragingen en het uitvoeren van systeemcommando’s. Dat laatste is nodig om het scherm in en uit te schakelen.
Hieronder bevindt zich de schakeling die via deze code wordt aangestuurd.
[Python code](/code/wake_up/wake_up.py).

<p align="center"> 
<img src="/img/Schema_Wakeup_Rpi.png" width="50%">

De sensoren zijn verbonden met de GPIO-pinnen. Het externe scherm is aangesloten via een HDMI-kabel en twee USB-naar-micro-USB-kabels. Deze laatste twee zorgen respectievelijk voor de stroomtoevoer en de capacitieve touchfunctionaliteit van het scherm.
Het gebruikte scherm is een 4,3-inch HDMI LCD-touchscreen. De benodigde stroom om de Raspberry Pi te laten werken, wordt geleverd door een powerbank.
De opstelling ziet er als volgt uit:

<p align="center"> 
<img src="/img/Opstelling_WakeUP.JPEG" width="50%">

Deze [demo](https://drive.google.com/file/d/15hXSTagw5abH1k6NjG4eRMN9H7aIJM2_/view?usp=drive_link) toont de werking van de interface en het wake-up mechanisme.

## Interface
Op het scherm dat wordt ingeschakeld door het wake-upmechanisme, wordt de interface weergegeven. Deze houdt de inventaris van de koelkast bij. De inventaris bevat gegevens zoals de houdbaarheidsdatum, het aantal en de locatie van producten.

De applicatie maakt gebruik van twee lokaal gehoste servers op de Raspberry Pi. De interface draait op een lokale webserver die automatisch in kioskmodus wordt weergegeven in Chromium, de browser op de Raspberry Pi. Dit gebeurt via een eenvoudige HTTP-server op poort 5173.

De logica en communicatie met de AI-assistent verlopen via een Python-backendserver. Deze houdt de inventarisgegevens bij, die worden opgeslagen in een JSON-bestand dat door de AI kan worden geraadpleegd.

De interface zelf is ontworpen met FigmaMake. Alle code met betrekking tot het design en de werking van de interface is hieruit overgenomen, met hier en daar enkele aanpassingen met behulp van AI. De Python-backendserver en de JSON-inventaris zijn achteraf eveneens met behulp van AI ontwikkeld.

<img src="/img/Interface.png" width="100%">

## Voice-assistent
De voice-assistent is het onderdeel van TasteMate dat speciaal ontworpen is voor visueel beperkte gebruikers. In plaats van een scherm te gebruiken, verloopt alle communicatie via spraak. De gebruiker stelt eenvoudigweg een vraag aan de koelkast en krijgt vervolgens een gesproken antwoord terug.

### Hoe werkt het?
Wanneer de assistent is opgestart, luistert een microfoon continu naar de gebruiker. Zodra er iets wordt gezegd, wordt de spraak via Google omgezet naar tekst. Die tekst wordt vervolgens doorgestuurd naar een AI, namelijk Google Gemini, die de vraag interpreteert en een passend antwoord formuleert.
Het antwoord van de AI wordt daarna via Microsoft Edge TTS omgezet naar spraak. Dit is een tekst-naar-spraakdienst die gebruikmaakt van een natuurlijke Nederlandse stem. Het gesproken antwoord wordt vervolgens afgespeeld via de luidspreker, zodat de gebruiker het antwoord duidelijk kan horen.

<img src="/img/assistent_flowchart_v2.svg" width="100%">

### Wat weet de assistent?
De assistent heeft toegang tot de volledige inhoud van de koelkast. Deze inhoud wordt bijgehouden in een bestand dat automatisch wordt bijgewerkt telkens wanneer er iets verandert via de interface. Denk hierbij aan producten die worden toegevoegd of verwijderd, of houdbaarheidsdata die worden aangepast. Bij elke vraag leest de assistent dit bestand opnieuw in, zodat hij altijd werkt met de meest actuele informatie.
Naast de inhoud van de koelkast onthoudt de assistent ook de laatste vragen en antwoorden uit het gesprek. Hierdoor kan hij de context van een gesprek begrijpen en logisch verder communiceren, zonder dat de gebruiker alles telkens opnieuw hoeft uit te leggen.

### Wat kan je vragen?
De assistent is bedoeld voor praktische vragen over de koelkast. Zo kan de gebruiker bijvoorbeeld vragen welke producten zich in de koelkast bevinden, wanneer een product vervalt of wat er in een bepaalde zone staat. De assistent geeft steeds een kort en natuurlijk antwoord, alsof de gebruiker met een persoon praat. Dit is een
[demo](https://drive.google.com/file/d/14yIs6-6K8cf76QumfmExPYO-qfYbNQzW/view?usp=sharing) hiervan.

### Technische opbouw
De assistent is geschreven in Python en maakt gebruik van verschillende externe libraries. Dit zijn kant-en-klare stukken code die specifieke taken uitvoeren, zodat deze niet volledig zelf ontwikkeld moeten worden.

Voor de spraakherkenning wordt de library SpeechRecognition gebruikt. Deze vangt de input van de microfoon op en stuurt die door naar Google om de spraak om te zetten naar tekst. Voor de spraakuitvoer wordt Microsoft Edge TTS gebruikt, een tekst-naar-spraakdienst die de antwoorden van de AI omzet naar een natuurlijk klinkende Nederlandse stem. Het afspelen van deze stem gebeurt via Pygame, een library die oorspronkelijk ontwikkeld werd voor het maken van spelletjes, maar ook geschikt is voor het afspelen van audio.

De communicatie met Google Gemini verloopt via de officiële Gemini Python-library van Google. Deze stuurt de vraag van de gebruiker, samen met de inhoud van de koelkast, naar de AI en ontvangt vervolgens het antwoord terug. De inventarisgegevens worden opgeslagen in een JSON-bestand, een eenvoudig tekstformaat dat zowel voor mensen als computers gemakkelijk leesbaar is. De libraries json en os zorgen ervoor dat dit bestand correct wordt ingelezen en verwerkt.

Tot slot wordt alles asynchroon uitgevoerd via asyncio. Dit betekent dat de assistent meerdere taken tegelijk kan afhandelen, zoals luisteren, verwerken en audio afspelen, zonder dat deze processen elkaar hinderen.
