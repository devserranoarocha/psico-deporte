<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private $hasher;

    public function __construct(UserPasswordHasherInterface $hasher)
    {
        $this->hasher = $hasher;
    }

    public function load(ObjectManager $manager): void
    {
        $admin = new User();
        $admin->setUsername('admin');
        
        // Añadimos el nuevo campo email
        $admin->setEmail('admin@psicodeporte.es');
        
        // Hasheamos la contraseña 'adminpass'
        $password = $this->hasher->hashPassword($admin, 'adminpass');
        $admin->setPassword($password);

        // Asignamos rol de administrador
        $admin->setRoles(['ROLE_ADMIN']);

        $manager->persist($admin);
        $manager->flush();
    }
}