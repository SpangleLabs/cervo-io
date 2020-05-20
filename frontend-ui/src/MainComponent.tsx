import {AnimalData, SpeciesData} from "@cervoio/common-ui-lib/src/animalData";
import React, {useState} from "react";
import ReactDOM from "react-dom";
import {FullZooJson, ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {MapContainer} from "./components/map/MapContainer";
import config from "./config";
import {getAuthCookie, toggleSelectionMembership, withLoading} from "@cervoio/common-ui-lib/src/utilities";
import {NavTopBar, NavTopBarOptions} from "./NavTopBar";
import {SpeciesSelectorPage} from "./SpeciesSelectorPage";

const styles = require("./MainComponent.css")


let lastZooSpeciesIds: number[] = []  // debouncing zoo list calls, so last one called gets evaluated
const MainComponent: React.FunctionComponent = () => {
    const [animalData] = useState(new AnimalData(getAuthCookie()))
    const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<number[]>([])
    const [selectedZoos, setSelectedZoos] = useState<ZooJson[]>([])
    const [postcode, setPostcode] = useState("")
    const [postcodeError, setPostcodeError] = useState(false)
    const [zooDistances, setZooDistances] = useState<Map<number, number>>(new Map())
    const [visibleInfoWindowZoos, setVisibleInfoWindowZoos] = useState<FullZooJson[]>([])
    const [loadingDistances, setLoadingDistances] = useState(false)
    const [loadingZoos, setLoadingZoos] = useState(false)

    const onSelectSpecies = (speciesId: number, selected?: boolean) => {
        setSelectedSpeciesIds(
            selectedSpeciesIds => {
                const newSelection = toggleSelectionMembership(selectedSpeciesIds, speciesId, selected)
                updateSelectedZoos(newSelection).then()
                return newSelection
            })
    }

    const onPostcodeUpdate = async (e: React.FormEvent<HTMLInputElement>) => {
        e.preventDefault();
        const postcodeEntry = e.currentTarget.value;
        setPostcode(postcodeEntry)
        if (postcodeEntry.length === 0) {
            setPostcodeError(false)
            return;
        }
        if (postcodeEntry.length <= 3) {
            setPostcodeError(true)
            return;
        }
        await updateZooDistances(postcodeEntry, selectedZoos);
    }

    const updateZooDistances = async (postcode: string, selectedZoos: ZooJson[]) => {
        if (postcode.length <= 3) {
            return;
        }
        await withLoading(setLoadingDistances, async () => {
            try {
                const zooDistances = await animalData.promiseGetZooDistances(postcode, selectedZoos.map(zoo => String(zoo.zoo_id)));
                const zooDistanceMap = zooDistances.reduce((map, obj) => {
                    map.set(obj.zoo_id, obj.metres);
                    return map
                }, new Map<number, number>());
                setZooDistances(zooDistanceMap)
                setPostcodeError(false)
                setSelectedZoos(selectedZoos)
            } catch {
                setZooDistances(new Map())
                setPostcodeError(postcode.length !== 0)
            }
        })
    }

    const updateSelectedZoos = async (newSelectedSpeciesIds: number[]) => {
        await withLoading(setLoadingZoos, async () => {
            lastZooSpeciesIds = newSelectedSpeciesIds
            const selectedZoos = await getZoosForSpeciesIds(newSelectedSpeciesIds)
            // Set state
            if(lastZooSpeciesIds == newSelectedSpeciesIds) {
                setSelectedZoos(selectedZoos)
                await updateZooDistances(postcode, selectedZoos);
            }
        })
    }

    const getZoosForSpeciesIds = async (speciesIds: number[]) => {
        const selectedSpecies = speciesIds.map((speciesId) => animalData.species.get(speciesId)).filter((x): x is SpeciesData => x !== undefined);
        const selectedZooses = await Promise.all(selectedSpecies.map((species) => species.getZooList()))
        // Flatten list of lists
        let selectedZoos: ZooJson[] = [];
        for (const zooList of selectedZooses) {
            selectedZoos = selectedZoos.concat(zooList);
        }
        // Uniqueify
        selectedZoos = selectedZoos.filter(function (value, index, arr) {
            const zooIds = arr.map(x => x.zoo_id);
            return zooIds.indexOf(value.zoo_id) === index
        });
        return selectedZoos
    }

    const onClickZooMarker = async (zoo: ZooJson) => {
        const fullZoo = await animalData.promiseFullZoo(zoo.zoo_id);
        const zooIds = visibleInfoWindowZoos.map(x => x.zoo_id)
        if (!zooIds.includes(zoo.zoo_id)) {
            const newList = visibleInfoWindowZoos.concat([fullZoo])
            setVisibleInfoWindowZoos(newList)
        }
    }

    const onCloseInfoWindow = async (zoo: FullZooJson) => {
        const newList = visibleInfoWindowZoos.filter(x => x.zoo_id != zoo.zoo_id)
        setVisibleInfoWindowZoos(newList)
    }

    return <>
        <div id={styles.selector}>
            <NavTopBar selected={NavTopBarOptions.bySpecies}/>
            <SpeciesSelectorPage
                animalData={animalData}
                selectedSpeciesIds={selectedSpeciesIds}
                onSelectSpecies={onSelectSpecies}

                postcode={postcode}
                postcodeError={postcodeError}
                onPostcodeUpdate={onPostcodeUpdate}
                loadingDistances={loadingDistances}

                selectedZoos={selectedZoos}
                onClickZooMarker={onClickZooMarker}
                zooDistances={zooDistances}

                loadingZoos={loadingZoos}
            />
        </div>
        <MapContainer
            selectedZoos={selectedZoos}
            google={{apiKey: (config['google_maps_key'])}}
            selectedSpeciesIds={selectedSpeciesIds}
            visibleInfoWindowsZoos={visibleInfoWindowZoos}
            onMarkerClick={onClickZooMarker}
            onInfoWindowClose={onCloseInfoWindow}
        />
    </>
}


document.addEventListener("DOMContentLoaded", function () {
    ReactDOM.render(<MainComponent/>, document.getElementById("main"));
});
