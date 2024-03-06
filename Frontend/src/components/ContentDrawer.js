import React, { useEffect, useState, useContext } from 'react';
import { NFTStorage } from 'nft.storage';

import { useReward } from 'react-rewards';
import FlipCard from './FlipCard';
import axios from 'axios';
import {
  Flex,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  DrawerCloseButton,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Divider,
  SimpleGrid,
  Heading,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
} from '@chakra-ui/react';

import { MapContext } from './MapContext';
import Recommender from './Recommender';
import { APIContext } from './APIContext';
import ParallaxDrawer from './ParallaxDrawer';

export default function ContentDrawer() {
  const {
    globalUserInfo,
    setCheckinState,
    checkinState,
    attractionsWithBusyness,
  } = useContext(APIContext);

  const {
    activeDrawer,
    isDrawerOpen,
    setIsDrawerOpen,
    hasTouchScreen,
    allowedLocation,
    setAllowedLocation,
  } = useContext(MapContext);

  const toastAttractionClosed = useToast();
  const toastNoLocation = useToast();
  const toastCheckIn = useToast();
  const toastNotCheckIn = useToast();
  const toastNFT = useToast();

  const getRandomAdjective = () => {
    const adjectives = [
      'Enchanting',
      'Majestic',
      'Vibrant',
      'Exotic',
      'Breathtaking',
      'Serene',
      'Captivating',
      'Whimsical',
      'Picturesque',
      'Alluring',
      'Mystical',
      'Spectacular',
      'Thrilling',
      'Dazzling',
      'Lush',
      'Tranquil',
      'Charming',
      'Blissful',
      'Awe-inspiring',
      'Spellbinding',
      'Fascinating',
      'Colorful',
      'Ethereal',
      'Glorious',
      'Unique',
      'Mesmerizing',
      'Enthralling',
      'Astonishing',
      'Dramatic',
      'Magical',
      'Opulent',
      'Radiant',
      'Wonderous',
      'Celestial',
      'Glistening',
      'Fantastic',
      'Intriguing',
      'Stunning',
      'Gorgeous',
      'Resplendent',
      'Brilliant',
      'Extraordinary',
      'Majestic',
      'Panoramic',
      'Enormous',
      'Unforgettable',
      'Dreamy',
      'Luminous',
      'Pristine',
      'Epic',
      'Transcendent',
      'Charming',
      'Ravishing',
      'Splendid',
      'Elegant',
      'Surreal',
      'Aromatic',
      'Astonishing',
      'Dazzling',
      'Dramatic',
      'Mystifying',
      'Pristine',
      'Sensational',
      'Tantalizing',
      'Unexplored',
      'Wonderful',
      'Zestful',
      'Zealous',
    ];

    const randomIndex = Math.floor(Math.random() * adjectives.length);
    return adjectives[randomIndex];
  };

  const randomWord = getRandomAdjective();

  const [prompt, setPrompt] = useState(null);
  const [prompt_No_Adj, setPromptAdj] = useState(null);
  const [promptIsSet, setPromptIsSet] = useState(false);
  const [promptNoAdjIsSet, setPromptNoAdj] = useState(false);

  const kebabToCamelCase = str => {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  };

  const capitalizeFirstLetter = str => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getAttractionInfo = attractionName => {
    const formattedAttractionName = capitalizeFirstLetter(
      kebabToCamelCase(attractionName)
    );
    const attraction = attractionsWithBusyness.find(
      attraction => attraction.name_alias === formattedAttractionName
    );
    return attraction || {};
  };

  const { reward: confettiReward, isAnimating: isConfettiAnimating } =
    useReward('confettiReward1', 'confetti', {
      lifetime: 2400,
      elementSize: 16,
      elementCount: 100,
    });

  const [placeHolderImageUrl, setPlaceHolderImaegUrl] = useState();

  const handleCheckIn = async (
    attractionID,

    attractionName,

    isOpen,
    randomWord,
    attractionNameAlias
  ) => {
    if (isOpen === false) {
      toastAttractionClosed({
        title: 'Attraction Closed!',
        description: 'Come back later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        containerStyle: { maxWidth: '80vw' },
      });
    } else {
      if (allowedLocation !== null) {
        const apiEndpoint =
          //'https://csi6220-2-vm1.ucd.ie/backend/api/user/update';
         'http://34.244.182.238:8001/api/user/update';
        const cachedUserCredential = localStorage.getItem('userCredential');

        const placeHolder = attractionNameAlias;
        setPlaceHolderImaegUrl(placeHolder);

        const idToken = cachedUserCredential; // get this from credential in signupform

        const requestBody = {
          id_token: idToken,
          attraction_id: attractionID,
           lat: 40.7794366,//allowedLocation.lat, hardcoded for testing replace with geolocation variable
          lng: -73.963244,//allowedLocation.lng,  hardcoded for testing reaplace with geolocation variable
        };

        axios
          .post(apiEndpoint, requestBody)
          .then(response => {
            // Handle the response data here
            if (response.data.code === 200) {
              //   // set logic that your marker has been ticked off
              setCheckinState(true);
              const PROMPT_TEST = `${attractionName} ${randomWord}`;
              const PROMPT_TEST_NO_ADJ = `${attractionName}`;

              setPrompt(PROMPT_TEST);
              setPromptAdj(PROMPT_TEST_NO_ADJ);

              confettiReward();
              toastCheckIn({
                title: 'Check in Successful!',
                description: "You've checked in successfully",
                status: 'success',
                duration: 3000,
                isClosable: true,
                containerStyle: { maxWidth: '80vw' },
              });

              // get the updated user info from the backend
            }
            if (response.data.code === 10050) {
              // distance too long
              setCheckinState(false);

              toastNotCheckIn({
                title: 'Check In Unsuccessful!',
                description: "You're too far away",
                status: 'error',
                duration: 3000,
                isClosable: true,
                containerStyle: { maxWidth: '80vw' },
              });
            }
          })
          .catch(error => {
            console.error('Error in API call:', error);
            // Handle errors here
          });
      } else {
        toastNoLocation({
          title: 'Check In Unsuccessful!',
          description: 'You must allow your current location',
          status: 'error',
          duration: 3000,
          isClosable: true,
          containerStyle: { maxWidth: '80vw' },
        });
      }
    }
  };

  const areAllBadgesTrue = () => {
    if (globalUserInfo && globalUserInfo.data && globalUserInfo.data.badgeDO) {
      const badgesStatusArray = Object.values(globalUserInfo.data.badgeDO);
      return badgesStatusArray.every(status => status === true);
    }
    return false;
  };

  const areAllBadgesFalse = () => {
    if (globalUserInfo && globalUserInfo.data && globalUserInfo.data.badgeDO) {
      const badgesStatusArray = Object.keys(globalUserInfo.data.badgeDO)
        .filter(key => !key.includes('_CreateTime'))
        .map(key => globalUserInfo.data.badgeDO[key]);

      return badgesStatusArray.every(status => status === false);
    }
    return false;
  };

  const areAllAttractionsTrue = () => {
    if (
      globalUserInfo &&
      globalUserInfo.data &&
      globalUserInfo.data.attractionStatusDO
    ) {
      const attractionStatusArray = Object.values(
        globalUserInfo.data.attractionStatusDO
      );
      return attractionStatusArray.every(status => status === true);
    }
    return false;
  };

  const areAllAttractionsFalse = () => {
    if (
      globalUserInfo &&
      globalUserInfo.data &&
      globalUserInfo.data.attractionStatusDO
    ) {
      const attractionStatusArray = Object.values(
        globalUserInfo.data.attractionStatusDO
      );
      return attractionStatusArray.every(status => status === false);
    }
    return false;
  };

  ////////////////////////////////
  /////                      /////
  ////     NFT MINTING CODE  /////
  ////                       /////
  ////////////////////////////////

  const [imageBlob, setImageBlob] = useState(null);

  const [fileMade, setFile] = useState(null);

  const generateArt = async (passedPrompt, safetyImage) => {
    if (passedPrompt !== null && safetyImage !== null) {
      try {
        const response = await axios.post(
          `https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5`,
          {
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE}`,
            },
            method: 'POST',
            inputs: passedPrompt,
          },
          { responseType: 'blob' }
        );

        // // Check if the response status is successful
        if (response.status === 200) {
          const generatedFile = new File([response.data], 'image.png', {
            type: 'image/png',
          });
          setFile(generatedFile);

          const url = URL.createObjectURL(response.data);
          setImageBlob(url);
        } else {
          // Use a placeholder image when the API call fails
          const safetyImageUrl = `/images/${safetyImage}.jpg`;

          // Fetch the placeholder image as a Blob
          const safetyImageBlob = await fetch(safetyImageUrl).then(res =>
            res.blob()
          );
          const generatedFile = new File([safetyImageBlob], 'image.jpg', {
            type: 'image/jpg',
          });
          setFile(generatedFile);

          // Use the object URL of the fetched Blob as the image blob
          const url = URL.createObjectURL(safetyImageBlob);
          setImageBlob(url);
        }
      } catch (err) {
        // Handle errors here and use the placeholder image
        const safetyImageUrl = `/images/${safetyImage}.jpg`;

        // Fetch the placeholder image as a Blob
        const safetyImageBlob = await fetch(safetyImageUrl).then(res =>
          res.blob()
        );
        const generatedFile = new File([safetyImageBlob], 'image.jpg', {
          type: 'image/jpg',
        });
        setFile(generatedFile);

        // Use the object URL of the fetched Blob as the image blob
        const url = URL.createObjectURL(safetyImageBlob);
        setImageBlob(url);
      }
    } else {
    }
  };

  // this cleans up the url after uploading the NFT art
  const cleanupIPFS = url => {
    if (url.includes('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
  };

  // Update uploadArtToIpfs function to accept the file and set it
  const uploadArtToIpfs = async (PROMPT_TEST, generatedFile) => {
    try {
      const nftstorage = new NFTStorage({
        token: process.env.REACT_APP_NFT_STORAGE,
      });

      const store = await nftstorage.store({
        name: `Badge - ${PROMPT_TEST}`,
        description: `You got the ${PROMPT_TEST} Badge!`,
        image: generatedFile,
      });
      return cleanupIPFS(store.data.image.href);
    } catch (err) {}
  };

  // nft wallet address from cached user info
  const [nftWalletAddress, setNFTWalletAddress] = useState(null);

  useEffect(() => {
    if (
      localStorage.getItem('loggedInfo') === 'true' &&
      globalUserInfo.data.nftLink
    ) {
      setNFTWalletAddress(globalUserInfo.data.nftLink);
    }
  }, [globalUserInfo]);

  // Update mintNft function to accept the prompt and imageURL as parameters
  const mintNft = async (promptFromFunc, imageURL, nftWalletAddress) => {
    try {
      if (!imageURL) {
        return;
      }

      // mint as an NFT on nftport
      const response = await axios.post(
        `https://api.nftport.xyz/v0/mints/easy/urls`,
        {
          file_url: imageURL,
          chain: 'polygon',//polygon is other chain option
          name: prompt_No_Adj,
          description: `You got the ${promptFromFunc} Badge.`,
          mint_to_address: nftWalletAddress,
        },
        {
          headers: {
            Authorization: process.env.REACT_APP_NFT_PORT,
          },
        }
      );

      const data = response.data;

      // Check if the minting was successful (e.g., status 200 or 201)
      if (response.status === 200 || response.status === 201) {
        confettiReward();
        toastNFT({
          title: 'NFT MINTED!',
          description: `You've acquired the "${promptFromFunc} NFT!".`,
          status: 'success',
          duration: 6000,
          isClosable: true,
          containerStyle: { maxWidth: '80vw' },
        });

        setPrompt(null);
        setPromptIsSet(false);
        setFile(null);
      } else {
        // Handle other possible response statuses or errors here
        toastNFT({
          title: 'Error Minting NFT.',
          description: `An error has occured in the minting process please try again later`,
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
        setPrompt(null);
        setPromptIsSet(false);
        setFile(null);
      }
    } catch (err) {}
  };

 // Use useEffect to set promptIsSet to true after prompt has been set
 useEffect(() => {
  if (prompt !== null && promptIsSet === false && prompt_No_Adj !== null && promptNoAdjIsSet === false ) {
    setPromptIsSet(true);
    setPromptNoAdj(true);
  }
}, [prompt]);

  // Use useEffect to call generateArt() when promptIsSet is true
  useEffect(() => {
    if (
      promptIsSet &&
      prompt !== null &&
      nftWalletAddress !== null &&
      nftWalletAddress !== '' &&
      nftWalletAddress !== '' &&
      nftWalletAddress.startsWith('0x') &&
      nftWalletAddress.length === 42
    ) {
      generateArt(prompt, placeHolderImageUrl);
    }

    if (
      promptIsSet &&
      prompt !== null &&
      (nftWalletAddress === '' || nftWalletAddress === null)
    ) {
      toastNotCheckIn({
        title: 'NFT Wallet Address Error.',
        description:
          'Please set your wallet address to mint and receive NFT Badges!',
        status: 'error',
        duration: 3000,
        isClosable: true,
        containerStyle: { maxWidth: '80vw' },
      });
      setPrompt(null);
      setPromptIsSet(false);
      setFile(null);
    }
  }, [promptIsSet, prompt, nftWalletAddress]);

  // Use useEffect to upload image to IPFS when fileMade is updated
  useEffect(() => {
    if (fileMade) {
      // Call the function to upload the art to IPFS and get the imageURL
      const uploadToIPFS = async () => {
        const imageURL = await uploadArtToIpfs(prompt, fileMade);
        if (imageURL) {
          toastNFT({
            title: 'NFT Minting in progress.',
            description: `Please wait as this can take several minutes.`,
            status: 'success',
            duration: 6000,
            isClosable: true,
          });

          // Call mintNft with the prompt and imageURL
          await new Promise(resolve => setTimeout(resolve, 60000));

          await mintNft(prompt_No_Adj, imageURL, nftWalletAddress);
          setFile(null);
        }
      };

      uploadToIPFS();
    }
  }, [fileMade]);

  /////////////////////////////////
  /////       END OF         /////
  ////     NFT MINTING CODE  /////
  ////                       /////
  ////////////////////////////////

  // Helper function to format badge names
  const formatBadgeName = name => {
    const words = name.split('_');
    const capitalizedWords = words.map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    );
    return capitalizedWords.join(' ');
  };

  function reformatDateTime(dateTimeString) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    const dateTime = new Date(dateTimeString);
    const formattedDateTime = dateTime.toLocaleDateString('en-US', options);

    return formattedDateTime;
  }


  return (
    <Drawer
      onClose={() => {
        setIsDrawerOpen(false);
      }}
      isOpen={isDrawerOpen}
      placement={hasTouchScreen ? 'bottom' : 'left'}
      size={hasTouchScreen ? 'xs' : 'md'}
      style={{ zIndex: 0 }}
    >
      <DrawerOverlay
        style={{ zIndex: '19' }}
        onClick={() => {
          setIsDrawerOpen(false);
        }}
      />

      <DrawerContent
        pointerEvents="all"
        containerProps={{ pointerEvents: 'none', height: '100%' }}
        height={hasTouchScreen ? '80vh' : '100%'}
        style={
          !hasTouchScreen
            ? {
                position: 'absolute',
                // top: '1',
                // height: 'calc(100% - 74px)',
                // border: 'solid 1px orangered',
                borderLeft: '0px',
                borderRadius: '20px',
                borderTopLeftRadius: '0px',
                borderBottomLeftRadius: '0px',
                zIndex: -1,
              }
            : {
                position: 'absolute',
                // top: '1',
                // height: 'calc(100% - 74px)',
                // border: 'solid 1px orangered',
                borderLeft: '0px',
                borderRadius: '20px',
                borderBottomRightRadius: '0px',
                borderBottomLeftRadius: '0px',
                zIndex: -1,
              }
        }
      >
        <DrawerCloseButton
          _focus={{
            outline: 'none',
            boxShadow: 'none',
          }}
        />
        {activeDrawer === 'recommender' && (
          <>
            <DrawerHeader>{`Recommender`}</DrawerHeader>
            <DrawerBody>
              <Recommender />
            </DrawerBody>
          </>
        )}
        {activeDrawer === 'attractions' && (
          <>
            {' '}
            <DrawerHeader>
              {`My Attractions`}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                zIndex={9999999}
                id="confettiReward1"
              />
            </DrawerHeader>
            <DrawerBody>
              <Tabs variant="soft-rounded">
                <TabList width="100%">
                  <Tab
                    width="50%"
                    m="0px 5px 0px 5px"
                    _selected={{ color: 'white', bg: 'orangered' }}
                  >
                    Attractions to Visit
                  </Tab>
                  <Tab
                    width="50%"
                    m="0px 5px 0px 5px"
                    _selected={{ color: 'white', bg: 'orangered' }}
                  >
                    Visited Attractions
                  </Tab>
                </TabList>
                <Divider
                  orientation="horizontal"
                  borderColor="orangered"
                  paddingTop="10px"
                />
                <TabPanels>
                  {/* ATTRACTIONS TO VISIT */}
                  <TabPanel pl={hasTouchScreen && 0} pr={hasTouchScreen && 0}>
                    {hasTouchScreen && (
                      <p>
                        Find the attraction you are visiting below and tap on it
                        to check in!
                        <br />
                        <br />
                      </p>
                    )}
                    {globalUserInfo &&
                    globalUserInfo.data &&
                    globalUserInfo.data.attractionStatusDO ? (
                      Object.entries(
                        globalUserInfo.data.attractionStatusDO
                      ).map(([attraction, status]) => {
                        if (!status) {
                          const attractionInfo = getAttractionInfo(attraction);
                          if (attractionInfo) {
                            return (
                              <Flex
                              // key={attraction}
                                border="2px solid orangered"
                                borderRadius="20px"
                                marginTop="5px"
                                overflow="hidden"
                                spacing="20px"
                                p="10px"
                                width={hasTouchScreen ? '100%' : '425px'}
                                mb="15px"
                                onClick={
                                  hasTouchScreen
                                    ? () => {
                                        handleCheckIn(
                                          attractionInfo.id,
                                          attractionInfo.name,
                                          attractionInfo.isOpen,
                                          randomWord,
                                          attractionInfo.name_alias
                                        );
                                      }
                                    : null
                                }
                              >
                                <Flex
                                  
                                  width="100%"
                                  flexDirection="column"
                                >
                                  <Flex flexDirection="row">
                                    {' '}
                                    <img
                                      src={`/images/${attractionInfo.name_alias}.jpg`}
                                      alt={attractionInfo.name_alias}
                                      style={{
                                        maxWidth: '100px',
                                        height: !hasTouchScreen
                                          ? '100px'
                                          : '80px',
                                        marginRight: '10px',
                                        // border: '2px solid orangered',
                                        borderRadius: '20px',
                                      }}
                                    />
                                    <div style={{ width: '100%' }}>
                                      <Heading
                                        size={!hasTouchScreen ? 'md' : 'sm'}
                                      >
                                        {attractionInfo.name}
                                      </Heading>
                                      {/* <p> {attractionInfo.full_address}</p> */}
                                      <Flex
                                        mt="10px"
                                        alignItems="center"
                                        justifyContent="space-between"
                                      >
                                        <Alert
                                          pl="0"
                                          width="fit-content"
                                          status="info"
                                          colorScheme={'white'}
                                          borderRadius={20}
                                          mt="-10px"
                                        >
                                          <Flex alignItems="center">
                                            <AlertIcon
                                              boxSize={5}
                                              mr="8px"
                                              color={
                                                attractionInfo.isOpen === false
                                                  ? 'grey'
                                                  : attractionInfo.businessRate <
                                                    35
                                                  ? 'green'
                                                  : 35 <=
                                                      attractionInfo.businessRate &&
                                                    attractionInfo.businessRate <
                                                      70
                                                  ? 'gold'
                                                  : 'red'
                                              }
                                            />
                                            <Flex flexDirection="column">
                                              <AlertTitle>
                                                {attractionInfo.isOpen === false
                                                  ? 'Closed'
                                                  : attractionInfo.businessRate <
                                                    35
                                                  ? 'Quiet'
                                                  : 35 <=
                                                      attractionInfo.businessRate &&
                                                    attractionInfo.businessRate <
                                                      70
                                                  ? 'Not Too Busy'
                                                  : 'Busy'}
                                              </AlertTitle>
                                              <AlertDescription>
                                                <p>
                                                  Busyness Index:&nbsp;
                                                  {attractionInfo.businessRate}
                                                </p>
                                              </AlertDescription>
                                            </Flex>
                                          </Flex>
                                        </Alert>
                                        {!hasTouchScreen && (
                                          <Flex justifyContent="flex-end">
                                            <Button
                                              bg="orange"
                                              _hover={{
                                                bg: 'orangered',
                                                color: 'white',
                                              }}
                                              _focus={{
                                                outline: 'none',
                                                boxShadow: 'none',
                                              }}
                                              style={{
                                                color: 'white',
                                                border: 'solid 1px orangered',
                                                borderRadius: '20px',
                                                marginBottom: '12px',
                                                justifySelf: 'flex-end',
                                              }}
                                              onClick={
                                                () =>
                                                  handleCheckIn(
                                                    attractionInfo.id,
                                                    attractionInfo.name,
                                                    attractionInfo.isOpen,
                                                    randomWord,
                                                    attractionInfo.name_alias
                                                  )
                                                // mintNft()
                                              }
                                            >
                                              Check In!
                                            </Button>
                                          </Flex>
                                        )}
                                      </Flex>
                                    </div>
                                  </Flex>
                                </Flex>
                              </Flex>
                            );
                          }
                        }
                        return null;
                      })
                    ) : (
                      <p>Loading attractions to visit...</p>
                    )}

                    {areAllAttractionsTrue() && (
                      <FlipCard
                      
                        frontContent={
                          <p>
                            <img
                              src={'/images/all_Attractions_Visited.jpg'}
                              alt="All Attractions are True"
                              style={{
                                width: '100%',
                                marginRight: '10px',
                                borderRadius: '5px',
                              }}
                            />
                          </p>
                        }
                        backContent={
                          <div>
                            <Heading size="md">
                              You Have Visited All the Attractions!
                            </Heading>
                          </div>
                        }
                      />
                    )}
                  </TabPanel>

                  {/* VISITED ATTRACTIONS */}
                  <TabPanel pl={hasTouchScreen && 0} pr={hasTouchScreen && 0}>
                    {globalUserInfo &&
                    globalUserInfo.data &&
                    globalUserInfo.data.attractionStatusDO ? (
                      Object.entries(
                        globalUserInfo.data.attractionStatusDO
                      ).map(([attraction, status]) => {
                        if (status) {
                          const attractionInfo = getAttractionInfo(attraction);
                          if (attractionInfo) {
                            return (
                              <Flex
                                border="2px solid green"
                                borderRadius="20px"
                                marginTop="5px"
                                overflow="hidden"
                                spacing="20px"
                                p="10px"
                                width={hasTouchScreen ? '100%' : '425px'}
                                mb="15px"
                              >
                                <Flex
                                  key={attraction}
                                  // mb={4}
                                  width="100%"
                                  flexDirection="column"
                                >
                                  <Flex flexDirection="row">
                                    {' '}
                                    <img
                                      src={`/images/${attractionInfo.name_alias}.jpg`}
                                      alt={attractionInfo.name_alias}
                                      style={{
                                        maxWidth: '100px',
                                        height: !hasTouchScreen
                                          ? '100px'
                                          : '80px',
                                        marginRight: '10px',
                                        // border: '2px solid orangered',
                                        borderRadius: '20px',
                                      }}
                                    />
                                    <div style={{ width: '100%' }}>
                                      <Heading
                                        size={!hasTouchScreen ? 'md' : 'sm'}
                                      >
                                        {attractionInfo.name}
                                      </Heading>
                                      {/* <p> {attractionInfo.full_address}</p> */}
                                      <Flex
                                        mt="10px"
                                        alignItems="center"
                                        justifyContent="space-between"
                                      >
                                        <Alert
                                          pl="0"
                                          width="fit-content"
                                          status="info"
                                          colorScheme={'white'}
                                          borderRadius={20}
                                          mt="-10px"
                                        >
                                          <Flex alignItems="center">
                                            <AlertIcon
                                              boxSize={5}
                                              mr="8px"
                                              color={
                                                attractionInfo.isOpen === false
                                                  ? 'grey'
                                                  : attractionInfo.businessRate <
                                                    35
                                                  ? 'green'
                                                  : 35 <=
                                                      attractionInfo.businessRate &&
                                                    attractionInfo.businessRate <
                                                      70
                                                  ? 'gold'
                                                  : 'red'
                                              }
                                            />
                                            <Flex flexDirection="column">
                                              <AlertTitle>
                                                {attractionInfo.isOpen === false
                                                  ? 'Closed'
                                                  : attractionInfo.businessRate <
                                                    35
                                                  ? 'Quiet'
                                                  : 35 <=
                                                      attractionInfo.businessRate &&
                                                    attractionInfo.businessRate <
                                                      70
                                                  ? 'Not Too Busy'
                                                  : 'Busy'}
                                              </AlertTitle>
                                              <AlertDescription>
                                                <p>
                                                  Busyness Index:&nbsp;
                                                  {attractionInfo.businessRate}
                                                </p>
                                              </AlertDescription>
                                            </Flex>
                                          </Flex>
                                        </Alert>
                                        <Flex justifyContent="flex-end">
                                          <Button
                                            _focus={{
                                              outline: 'none',
                                              boxShadow: 'none',
                                            }}
                                            style={{
                                              backgroundColor: '#17B169',
                                              color: 'white',
                                              border: 'solid 1px green',
                                              borderRadius: '20px',
                                              marginBottom: '12px',
                                            }}
                                          >
                                            Visited!
                                          </Button>
                                        </Flex>
                                      </Flex>
                                    </div>
                                  </Flex>
                                </Flex>
                              </Flex>
                            );
                          }
                        }
                        return null;
                      })
                    ) : (
                      <p>Loading attractions to visit...</p>
                    )}

                    {/* Conditional rendering for the image when all attractions are false */}
                    {areAllAttractionsFalse() && (
                      <FlipCard
                        frontContent={
                          <img
                            src={'/images/no_Attractions_Visited.jpg'}
                            alt="All Attractions are False"
                            style={{ maxWidth: '100%' }}
                          />
                        }
                        backContent={
                          <Heading size="md">
                            You Have Not Visited Any Attractions Yet!
                          </Heading>
                        }
                      />
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </DrawerBody>
          </>
        )}
        {activeDrawer === 'badges' && (
          <>
            {' '}
            <DrawerHeader>{`My Badges`}</DrawerHeader>
            <DrawerBody>
              <Tabs variant="soft-rounded">
                <TabList width="100%">
                  <Tab
                    width="50%"
                    m="0px 5px 0px 5px"
                    _selected={{ color: 'white', bg: 'orangered' }}
                  >
                    Badges to Collect
                  </Tab>
                  <Tab
                    width="50%"
                    m="0px 5px 0px 5px"
                    _selected={{ color: 'white', bg: 'orangered' }}
                  >
                    My Badges
                  </Tab>
                </TabList>
                <Divider
                  orientation="horizontal"
                  borderColor="orangered"
                  paddingTop="10px"
                />
                <TabPanels>
                  <TabPanel pl={hasTouchScreen && 0} pr={hasTouchScreen && 0}>
                    {Object.entries(globalUserInfo.data.badgeDO).map(
                      ([badge, status]) => {
                        if (status === false) {
                          const formattedBadgeName = formatBadgeName(badge);
                          return (
                            <Flex
                              border="2px solid orangered"
                              borderRadius="20px"
                              marginTop="5px"
                              overflow="hidden"
                              spacing="20px"
                              p="10px"
                              width={hasTouchScreen ? '100%' : '425px'}
                              mb="15px"
                            >
                              <Flex
                                key={badge}
                                width="100%"
                                flexDirection="column"
                              >
                                <Flex flexDirection="row">
                                  <img
                                    src={`/images/badgeimages/${badge}.jpg`}
                                    alt={badge}
                                    style={{
                                      maxWidth: !hasTouchScreen
                                        ? '100px'
                                        : '80px',
                                      height: !hasTouchScreen
                                        ? '100px'
                                        : '80px',
                                      marginRight: '10px',
                                      border: '1px solid orangered',
                                      borderRadius: '20px',
                                    }}
                                  />
                                  <div style={{ width: '100%' }}>
                                    <Heading
                                      size={!hasTouchScreen ? 'md' : 'sm'}
                                    >
                                      {formattedBadgeName}
                                    </Heading>
                                    <p>
                                      {' '}
                                      You still have to get the{' '}
                                      {formattedBadgeName}!
                                    </p>
                                  </div>
                                </Flex>
                              </Flex>
                            </Flex>
                          );
                        }
                        return null;
                      }
                    )}
                    {areAllBadgesTrue() && (
                      <FlipCard
                        frontContent={
                          <p>
                            <img
                              src={'/images/badgeimages/all_Badges.jpg'}
                              alt="All Attractions are True"
                              style={{
                                width: '100%',
                                marginRight: '10px',

                                borderRadius: '5px',
                              }}
                            />
                          </p>
                        }
                        backContent={
                          <div>
                            <Heading size="md">
                              You've Got All The Badges!
                            </Heading>
                          </div>
                        }
                      />
                    )}
                  </TabPanel>
                  <TabPanel
                    width={hasTouchScreen && '100%'}
                    pl={hasTouchScreen && 0}
                    pr={hasTouchScreen && 0}
                  >
                    {Object.entries(globalUserInfo.data.badgeDO).map(
                      ([badge, status]) => {
                        const badgeCreateTimeKey = `${badge}_CreateTime`;
                        const badgeCreateTime =
                          globalUserInfo.data.badgeDO[badgeCreateTimeKey];

                        if (
                          status === true &&
                          badgeCreateTime !== '3333-01-01T01:00:00'
                        ) {
                          const formattedBadgeName = formatBadgeName(badge);

                          return (
                            <Flex
                              border="2px solid gold"
                              borderRadius="20px"
                              marginTop="5px"
                              overflow="hidden"
                              spacing="20px"
                              p="10px"
                              width={hasTouchScreen ? '100%' : '425px'}
                              mb="15px"
                            >
                              <Flex
                                key={badge}
                                width="100%"
                                flexDirection="column"
                              >
                                <Flex flexDirection="row">
                                  <img
                                    src={`/images/badgeimages/${badge}.jpg`}
                                    alt={badge}
                                    style={{
                                      maxWidth: !hasTouchScreen
                                        ? '100px'
                                        : '80px',
                                      height: !hasTouchScreen
                                        ? '100px'
                                        : '80px',
                                      marginRight: '10px',
                                      border: '1px solid gold',
                                      borderRadius: '20px',
                                    }}
                                  />
                                  <div style={{ width: '100%' }}>
                                    <Heading
                                      size={!hasTouchScreen ? 'md' : 'sm'}
                                    >
                                      {formattedBadgeName}
                                    </Heading>
                                    <p>
                                      {' '}
                                      You got the {formattedBadgeName} at{' '}
                                      {reformatDateTime(badgeCreateTime)} Great
                                      Job!
                                    </p>
                                  </div>
                                </Flex>
                              </Flex>
                            </Flex>
                          );
                        }
                        return null;
                      }
                    )}
                    {areAllBadgesFalse() && (
                      <FlipCard
                        frontContent={
                          <img
                            src={'/images/badgeimages/no_badges.jpg'}
                            alt="All Badges are False"
                            style={{
                              width: '100%',
                              marginRight: '10px',
                              borderRadius: '5px',
                            }}
                          />
                        }
                        backContent={
                          <div>
                            <Heading size="md">
                              You Do Not Have Any Badges Yet!
                            </Heading>
                          </div>
                        }
                      />
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </DrawerBody>
          </>
        )}

        {activeDrawer === 'guide' && (
          <>
            <DrawerHeader>{`Guide`}</DrawerHeader>
            <DrawerBody>
              <ParallaxDrawer />
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
