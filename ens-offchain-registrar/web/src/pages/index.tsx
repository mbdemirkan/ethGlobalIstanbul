import { Button, Input } from '@ensdomains/thorin'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Head from 'next/head'
import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

import { Footer } from '@/components/Footer'
import { useDebounce } from '@/hooks/useDebounce'
import { useFetch } from '@/hooks/useFetch'
import { Card, Form, Helper, Link, Spacer } from '@/styles'
import { WorkerRequest } from '@/types'
import { fetchEnsAddress } from '@wagmi/core'

 


export default function App() {
  const { address } = useAccount()

  const [name, setName] = useState<string | undefined>(undefined)
  const [id, setId] = useState<string | undefined>(undefined)
  const [addressFromEns, setAddressFromEns] = useState<string | undefined>(undefined)
  const [ensName, setEnsName] = useState<string | undefined>(undefined)
  
  

  const regex = new RegExp('^[a-z0-9-]+$')
  const debouncedName = useDebounce(id, 500)
  const enabled = !!debouncedName && regex.test(debouncedName)

  const { data, isLoading, signMessage, variables } = useSignMessage()

  const requestBody: WorkerRequest = {
    name: `${debouncedName}.offchaindemo.eth`,
    owner: address!,
    addresses: { '60': address },
    texts: { id },
    signature: {
      hash: data!,
      message: variables?.message!,
    },
  }

  const {
    data: gatewayData,
    error: gatewayError,
    isLoading: gatewayIsLoading,
  } = useFetch(data && 'https://ens-gateway.gregskril.workers.dev/set', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  

  return (
    <>
      <Head>
        <title>SmartGrade ENS Registrar</title>
        <meta property="og:title" content="Offchain ENS Registrar" />
        <meta
          name="description"
          content="Quick demo of how offchain ENS names work"
        />
        <meta
          property="og:description"
          content="Quick demo of how offchain ENS names work"
        />

<link href="https://cdn.jsdelivr.net/npm/daisyui@4.4.2/dist/full.min.css" rel="stylesheet" type="text/css" />
<script src="https://cdn.tailwindcss.com"></script>


      </Head>

      <Spacer />

      <Card>
        <ConnectButton showBalance={false} />

        <Form
          onSubmit={(e) => {
            e.preventDefault()
            signMessage({
              message: `Register ${debouncedName}.offchaindemo.eth`,
            })
          }}
        >
          <Input
            type="text"
            label="Student Id"
            placeholder="Enter your student Id"
            disabled={!!data || !address}
            onChange={(e) => {setId(e.target.value); setName(e.target.value) }}
          />
          <Input
            type="text"
            label="Student Name"
            placeholder="Enter your name"
            disabled={!!data || !address}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="text"
            label="Name"
            suffix=".smartgrade.eth"
            placeholder="ens"
            value={id}
            required
            disabled={!!data || !address}
            onChange={(e) => setName(e.target.value)}
          />

          <Button
            type="submit"
            disabled={!enabled || !!data}
            loading={isLoading || gatewayIsLoading}
          >
            Register
          </Button>
        </Form>

        {gatewayError ? (
          <Helper type="error">
            {gatewayError.message === 'Conflict'
              ? 'Somebody already registered that name'
              : 'Something went wrong'}
          </Helper>
        ) : gatewayData ? (
          <Helper>
            <p>
              Visit the{' '}
              <Link href={`https://ens.app/${debouncedName}.offchaindemo.eth`}>
                ENS Manager
              </Link>{' '}
              to see your name
            </p>
          </Helper>
        ) : !!debouncedName && !enabled ? (
          <Helper type="error">Name must be lowercase alphanumeric</Helper>
        ) : null}
      </Card>
      <Form
          onSubmit={(e) => {
            e.preventDefault();
            setAddressFromEns("");
            console.log(ensName + '.offchaindemo.eth',);
            fetchEnsAddress({
              name: ensName + '.offchaindemo.eth',
              chainId: 11155111,
            }).then(data => {
              console.log(data);
              if (address == data) {
                console.log("thesame");
                if (ensName == "s1") {
                  data = "http://POAP.xyz/claim/14cd6k";
                } else if (ensName == "s2") {
                  data = "http://POAP.xyz/claim/jbzknk";
                } else if (ensName == "s3") {
                  data = "http://POAP.xyz/claim/hybuwl";
                } else if (ensName == "s4") {
                  data = "http://POAP.xyz/claim/p8phpq";
                }
              } else {
                data = 'No';
              }
              setAddressFromEns(data);
            });
          }}
        >
      <div className="card w-96 bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Get POAP link</h2>
    <p>In order to prove your attendence enter your student Id</p>
    <div className="card-actions justify-end">
    <Input
            type="text"
            label="Student Id"
            suffix=".smartgrade.eth"
            placeholder="ens"
            value={ensName}
            required
            onChange={(e) => setEnsName(e.target.value)}
          />
    <Button
            type="submit"
            disabled={!address}
          >
            Submit
          </Button>
          <div><a href={addressFromEns}>Your POAP Link</a></div>
    </div>
  </div>
</div>
</Form>

      <Footer />
    </>
  )
}
