# TasteMate Overkoepelde Opdracht
### Introductie
De TasteMate is een product dat het gebruik van de koelkast voor visueel beperkte personen bevordert. Het bestaat hoofdzakelijk uit twee delen, namelijk een touchscreeninterface en een AI-assistent. Het eerste onderdeel wordt gebruikt door begeleiders en/of familieleden. Hierop wordt de inventaris van de koelkast bijgehouden. Deze kan vervolgens worden geraadpleegd door de AI-assistent, die nuttige informatie doorspeelt naar de visueel beperkte persoon via text-to-speech.

Het eerste onderdeel wordt geactiveerd via een wake-upmechanisme. Dit maakt gebruik van een afstandssensor die, wanneer er een persoon voor de koelkast of TastMate staat, een signaal stuurt naar het touchscreen om in te schakelen. De interface wordt hierbij lokaal gehost en is ontworpen met FigmaMake.

Het tweede onderdeel werkt via een microfoon die luistert naar de vraag van de blinde of slechtziende persoon. Via een AI-assistent, die gekoppeld is aan Gemini, wordt deze vraag beantwoord met informatie uit de interface. Dit antwoord wordt vervolgens via een luidspreker gecommuniceerd naar de gebruiker.

## Validatie inputs
### Afstandssensor
De afstandssensor wordt in het project gebruikt om te detecteren ofdat er een persoon voor de koelkast staat. Deze meet de afstand tot een bepaald object.
Voor het valideren van de aansluiting is gebruik gemaakt van de [datasheet](/datasheets/HCSR04.pdf). De opstelling bevat een Raspberry pi, de sensor en vier jumpers.

<p align="center"> 
<img src="/img/Schema_Afstandssensor.png" width="50%">

De [code](/inputs/afstandssensor.py) maakt gebruik van de gpiozero library en de time library.

## Validatie outputs
### Buzzer
De buzzer maakt een kort geluid om gebruikers te vertellen dat het scherm aan staat. Voor het valideren van de aansluiting is gebruik gemaakt van de [datasheet](/datasheets/Buzzer.pdf). De opstelling bevat een Raspberry pi, de buzzer en twee jumpers.

<p align="center"> 
<img src="/img/Schema_Buzzer.png" width="50%">

De [code](/outputs/buzzer.py) maakt gebruik van de gpiozero library en de time library.

### Scherm
Het scherm toont de interface en kan gebruikt worden via touchscreen. Er wordt gebruik gemaakt van een 4.3 inch HDMI LCD. 
De opstelling bevat een Raspberry pi, het scherm en een HDMI-kabel. De connectie gebeurt dus via de HDMI-kabel.
De [code](/outputs/scherm.py) maakt gebruik van de tkinter library

## Wake-up mechanisme

Het wake-up mechanisme maakt gebruik van de afstandssensor om te detecteren ofdat er een persoon in de buurt is. Dit vertelt dan aan de Raspberry pi dat het scherm aan moet alsook dat de buzzer moet afgaan. Zo is er een visuele en auditieve cue om aan de gebruiker te communiceren dat het scherm aan staat. Is er geen interactie met het scherm of staat er niemand meer voor zal het scherm na 10 seconden terug uit gaan om dan te wachten voor 30 seconden en terug een scan te doen.
De code volgt deze logica:
<p align="center"> 
<img src="/img/Flowchart wake-up.png" width="100%">

### Test 1 Arduino

Voor dit onderdeel is het de bedoeling om met Arduino een systeem te maken dat detecteert wanneer er een persoon voor de koelkast staat. Vervolgens moet het scherm aangaan en krijgt de gebruiker een audiotrigger om te laten weten dat het scherm is ingeschakeld.
Als de persoon voor het scherm gedetecteerd blijft, blijft het scherm ingeschakeld. Wanneer de persoon echter meer dan 10 seconden weg is, schakelt het scherm automatisch weer uit.
Er is gebruikgemaakt van enkele Arduino-componenten, zoals de Arduino Uno, een afstandssensor, een lcd-scherm en een buzzer.
Het resultaat is quick en dirty gerealiseerd om zo weinig tijd te verliezen aan het opfleuren van iets dat louter testen van een concept is.
Hier onder is het Wokwi schema te vinden van het arduino project. De code is te vinden onder [Arduino_Code](src/Arduino_Code).

<img src="/img/Schema_Wakeup.jpg" width="100%">

## Interface

Op het scherm dat aan gaat door het wake-up mechanisme wordt de interface getoond. Dit houdt de invenstaris van de koelkast bij. Daarin zitten gegevens zoals de houdbaarheidsdatum, het aantal en de locatie van producten. 

De applicatie maakt gebruik van 2 lokaal gehoste servers op de Raspberry pi. De interface is een lokale webserver die automatisch wordt weergegeven in kioskmodus op chromium. Dit is de browser op de Raspberry pi. Dit is een eenvoudige HTTP server op poort 5173. De logica en communicatie met de AI-assistent gebeurt via een Python backend server. Deze houdt de inventarisgegevens bij, die worden opgeslagen in een JSON-bestand die kan worden geraadpleegd door de AI.

De interface zelf is ontworpen via FigmaMake. Alle code rondom het design en de werking van de interface zijn dus hieruit gekopieerd met hier en daar enkele tweaks met AI. De Python backend server en de JSON inventaris zijn achteraf met behulp van AI geschreven.

<img src="/img/Interface.png" width="100%">

## Voice-assistent

De voice-assistent is het gedeelte van TasteMate dat speciaal ontworpen is voor visueel beperkte gebruikers. In plaats van een scherm te gebruiken, verloopt alle communicatie via spraak. De gebruiker stelt gewoon een vraag aan de koelkast, en krijgt een gesproken antwoord terug.

### Hoe werkt het?
Wanneer de assistent opgestart is, luistert een microfoon continu naar de gebruiker. Zodra er iets gezegd wordt, wordt de spraak omgezet naar tekst via Google. Die tekst wordt vervolgens doorgestuurd naar een AI, namelijk Google Gemini, die de vraag begrijpt en een passend antwoord formuleert.
Het antwoord van de AI wordt daarna omgezet naar spraak via Microsoft Edge TTS, een tekst-naar-spraak dienst die een natuurlijke Nederlandse stem gebruikt. Dit gesproken antwoord wordt vervolgens afgespeeld via de luidspreker, zodat de gebruiker het antwoord duidelijk kan horen.

### Wat weet de assistent?
De assistent heeft toegang tot de volledige inhoud van de koelkast. Die inhoud wordt bijgehouden in een bestand dat automatisch bijgewerkt wordt telkens wanneer er iets verandert via de interface. Denk aan producten die toegevoegd of verwijderd worden, of houdbaarheidsdata die aangepast wordt. Bij elke vraag leest de assistent dit bestand opnieuw in, zodat hij altijd werkt met de meest actuele informatie.
Naast de inhoud van de koelkast onthoudt de assistent ook de laatste paar vragen en antwoorden uit het gesprek. Zo kan hij de context van een gesprek begrijpen en logisch verder praten, zonder dat de gebruiker alles telkens opnieuw moet uitleggen.

### Wat kan je vragen?
De assistent is bedoeld voor praktische vragen over de koelkast. Je kan bijvoorbeeld vragen welke producten er in de koelkast zitten, wanneer iets over datum gaat, of wat er in een bepaalde zone staat. De assistent geeft altijd een kort en natuurlijk antwoord, alsof je met een persoon praat.You said: Wat je nu hebt is perfect voeg echter toch nog in een extra stuk wat meer toelichting bij het technische zoals misschien de libraries enzoWat je nu hebt is perfect voeg echter toch nog in een extra stuk wat meer toelichting bij het technische zoals misschien de libraries enzo17:28Claude responded: Voice-assistentVoice-assistent
De voice-assistent is het gedeelte van TasteMate dat speciaal ontworpen is voor visueel beperkte gebruikers. In plaats van een scherm te gebruiken, verloopt alle communicatie via spraak. De gebruiker stelt gewoon een vraag aan de koelkast, en krijgt een gesproken antwoord terug.

### Hoe werkt het?
Wanneer de assistent opgestart is, luistert een microfoon continu naar de gebruiker. Zodra er iets gezegd wordt, wordt de spraak omgezet naar tekst via Google. Die tekst wordt vervolgens doorgestuurd naar een AI, namelijk Google Gemini, die de vraag begrijpt en een passend antwoord formuleert.
Het antwoord van de AI wordt daarna omgezet naar spraak via Microsoft Edge TTS, een tekst-naar-spraak dienst die een natuurlijke Nederlandse stem gebruikt. Dit gesproken antwoord wordt vervolgens afgespeeld via de luidspreker, zodat de gebruiker het antwoord duidelijk kan horen.

### Wat weet de assistent?
De assistent heeft toegang tot de volledige inhoud van de koelkast. Die inhoud wordt bijgehouden in een bestand dat automatisch bijgewerkt wordt telkens wanneer er iets verandert via de interface. Denk aan producten die toegevoegd of verwijderd worden, of houdbaarheidsdata die aangepast wordt. Bij elke vraag leest de assistent dit bestand opnieuw in, zodat hij altijd werkt met de meest actuele informatie.
Naast de inhoud van de koelkast onthoudt de assistent ook de laatste paar vragen en antwoorden uit het gesprek. Zo kan hij de context van een gesprek begrijpen en logisch verder praten, zonder dat de gebruiker alles telkens opnieuw moet uitleggen.

### Wat kan je vragen?
De assistent is bedoeld voor praktische vragen over de koelkast. Je kan bijvoorbeeld vragen welke producten er in de koelkast zitten, wanneer iets over datum gaat, of wat er in een bepaalde zone staat. De assistent geeft altijd een kort en natuurlijk antwoord, alsof je met een persoon praat.

### Technische opbouw
De assistent is geschreven in Python en maakt gebruik van een aantal externe libraries, dit zijn kant-en-klare stukken code die een specifieke taak uitvoeren zodat die niet zelf geschreven moet worden.
Voor de spraakherkenning wordt SpeechRecognition gebruikt. Dit is een library die de microfooninput opvangt en doorstuurt naar Google om om te zetten naar tekst. Voor de spraakuitvoer wordt Edge TTS van Microsoft gebruikt, die de tekst van de AI omzet naar een natuurlijk klinkende Nederlandse stem. Het afspelen van die stem gebeurt via Pygame, een library die oorspronkelijk bedoeld is voor het maken van spelletjes, maar ook uitstekend werkt voor het afspelen van audio.
De communicatie met Google Gemini verloopt via de officiële Gemini Python library van Google. Die stuurt de vraag van de gebruiker, samen met de inhoud van de koelkast, naar de AI en ontvangt het antwoord terug. De inventarisdata zelf wordt opgeslagen in een JSON-bestand, een eenvoudig tekstformaat dat makkelijk leesbaar is voor zowel mensen als computers. De libraries json en os zorgen ervoor dat dit bestand correct ingelezen en verwerkt wordt.
Tot slot wordt alles asynchroon uitgevoerd via asyncio, wat betekent dat de assistent meerdere taken tegelijk kan afhandelen, zoals luisteren, verwerken en afspelen, zonder dat die elkaar in de weg zitten.