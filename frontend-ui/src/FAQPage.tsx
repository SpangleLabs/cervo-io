import React from "react";


export const FAQPage: React.FunctionComponent = () => {
    return <div>
        <h3>Why isn't [whatever] species listed?</h3>
        <p>I am starting with species of deer and expanding out. I think even then I may skip invertibrates and fish, as
            they can be tricky to find listings of.</p>

        <h3>The distances seem to be slightly off?</h3>
        <p>I am stripping postcodes down to postcode-sectors to preserve visitor's privacy and keep the cache a bit
            smaller, this will reduce the accuracy slightly, but not too much.</p>

        <h3>Why is this system called cervo?</h3>
        <p>"Cervo" the esperanto word for deer of the genus <span className="latin_name">cervus</span>, such as red deer
            and sika. Originally it was called "akvocervo", which is the esparanto word for Sambar, because I think they
            have a <a href="https://youtu.be/KTaSEwAQNM0?t=14s">cute honk!</a> But that name was too tricky.</p>

        <h3>Why does the website only cover the UK?</h3>
        <p>There's a lot of zoos, even in just the UK. Hopefully I'll expand outwards eventually, to EAZA members or
            maybe WAZA, but that will be some time.</p>

        <h3>You are missing a zoo</h3>
        <p>Ah, whoops! Please contact me at cervo@spangle.org.uk, tell me the details of the zoo, and I'll work on fixing
            that.</p>

        <h3>Why do you call X, Y?</h3>
        <p>Sometimes I've had to pick a common name, where multiple exist. Hopefully one day I will change this system
            to allow multiple common names, but for now, I've got to pick one. For personal preference, I generally tend
            not to pick species names which are named after a western missionary, naturalist or officer who "discovered"
            a species that local people were interacting with before they arrived. This is why "Père David's deer",
            "Eld's deer", and "Reeve's muntjac" are listed as "Milu", "Thamin" and "Chinese muntjac" respectively.</p>

        <h1>Privacy Policy</h1>
        <p>I don't store any weird information about users.</p>
        <p>When a postcode is entered for distance calculations, the postcode district (the first half, and a single
            character from the second half, e.g. 'SW1A 0') is cached, to save querying for zoo distances multiple times.
            At this level, a postcode sector is not individually identifiable, and is therefore safe and GDPR-compliant
            data.</p>
        <p>For logins, which are currently an admin-only issue, the IP address of the session token is stored, to ensure
            the token is not hijacked. Any admins (of which there is currently only me) may request that data be
            removed, which would just mean logging them out and deleting their current session token.</p>
        <p>As for security, this whole site is <a href="https://github.com/SpangleLabs/cervo-io">published on github</a>
            and can be audited. Passwords are hashed and salted with bcrypt, with a decent number of runs to ensure hash
            cracking would be difficult. There's no personal data stored within anyway, so there's not really a risk
            from that avenue.</p>

        <h1>Terms and Conditions</h1>
        <p>I can't guarantee that the data on here is 100% up to date, so take things with a pinch of salt. Please don't
            trek across the country in search of a species this site says is at a zoo, without first checking that zoo's
            own website to double-check, unfortunately sometimes zoos have to change the selection of species they care
            for, or even shut down entirely. Similarly, these listings can vary in quite what they mean when they say a
            zoo or park "has" a species. Sometimes it means the animals are in an enclosure, but sometimes the animals
            are able to come and go as they please. (The latter is often the case with wildlife parks.) Sometimes you
            can feed and touch the animals, sometimes you cannot, please obey local signage when it instructs
            you on this, and default to not touching the animals, even if they have soft snouts.</p>
    </div>
}
